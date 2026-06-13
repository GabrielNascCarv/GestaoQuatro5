import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { AuthUser, AuthCredentials, IAuthGateway } from '../../contracts/gateways/auth-gateway';

export class KeycloakAuthGateway implements IAuthGateway {
  private kcAdminClient: KeycloakAdminClient;

  constructor() {
    this.kcAdminClient = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_BASE_URL,
      realmName: process.env.KEYCLOAK_REALM,
    });
  }

  private async authenticate() {
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('KEYCLOAK_CLIENT_ID and KEYCLOAK_CLIENT_SECRET are required environment variables.');
    }

    await this.kcAdminClient.auth({
      grantType: 'client_credentials',
      clientId,
      clientSecret,
    });
  }

  async createUser(user: AuthUser): Promise<{ keycloakId: string }> {
    await this.authenticate();

    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.length > 0 ? lastNameParts.join(' ') : firstName;

    // 1. Create user in Keycloak
    let keycloakId: string;
    try {
      const createdUser = await this.kcAdminClient.users.create({
        username: user.email,
        email: user.email,
        firstName,
        lastName,
        enabled: true,
        emailVerified: true,
      });

      if (!createdUser.id) {
        throw new Error('ID not returned.');
      }
      keycloakId = createdUser.id;
    } catch (err: any) {
      console.error('Error creating user in Keycloak:', err.message || err);
      throw new Error(`Failed to create user in Keycloak: ${err.message || err}`);
    }

    // 2. Set password (non-temporary)
    if (user.password) {
      try {
        await this.kcAdminClient.users.resetPassword({
          id: keycloakId,
          credential: {
            type: 'password',
            value: user.password,
            temporary: false,
          },
        });
      } catch (err: any) {
        console.error('Error resetting user password in Keycloak:', err.message || err);
        throw new Error(`Failed to set user password in Keycloak: ${err.message || err}`);
      }
    }

    // 3. Find client UUID
    const clientIdName = process.env.KEYCLOAK_CLIENT_ID;
    let clientUuid: string;
    try {
      const clients = await this.kcAdminClient.clients.find({
        clientId: clientIdName,
      });

      const foundClient = clients[0]?.id;
      if (!foundClient) {
        throw new Error(`Client '${clientIdName}' not found.`);
      }
      clientUuid = foundClient;
    } catch (err: any) {
      console.error('Error querying client UUID in Keycloak (check if Service Account has "view-clients" role):', err.message || err);
      throw new Error(`Failed to query client UUID in Keycloak: ${err.message || err}`);
    }

    // 4. Find requested client role
    const roleName = user.role || 'user';
    let userRole: any;
    try {
      const clientRoles = await this.kcAdminClient.clients.listRoles({
        id: clientUuid,
      });

      const foundRole = clientRoles.find((role) => role.name === roleName);
      if (!foundRole) {
        throw new Error(`Role '${roleName}' not found under client '${clientIdName}'.`);
      }
      userRole = foundRole;
    } catch (err: any) {
      console.error('Error finding client role in Keycloak:', err.message || err);
      throw new Error(`Failed to find client role '${roleName}' in Keycloak: ${err.message || err}`);
    }

    // 5. Assign client role to user
    try {
      await this.kcAdminClient.users.addClientRoleMappings({
        id: keycloakId,
        clientUniqueId: clientUuid,
        roles: [
          {
            id: userRole.id!,
            name: userRole.name!,
          },
        ],
      });
    } catch (err: any) {
      console.error('Error mapping client role to user in Keycloak:', err.message || err);
      throw new Error(`Failed to assign role to user in Keycloak: ${err.message || err}`);
    }

    return { keycloakId };
  }

  async issueAccessToken(credentials: AuthCredentials): Promise<{ accessToken: string; refreshToken: string }> {
    const baseUrl = process.env.KEYCLOAK_BASE_URL;
    const realm = process.env.KEYCLOAK_REALM;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    if (!baseUrl || !realm || !clientId) {
      throw new Error('KEYCLOAK_BASE_URL, KEYCLOAK_REALM, and KEYCLOAK_CLIENT_ID are required.');
    }

    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'password',
      username: credentials.email,
      password: credentials.password,
      client_id: clientId,
    });

    if (clientSecret) {
      body.append('client_secret', clientSecret);
    }

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status ${response.status}: ${errorText}`);
      }

      const payload = (await response.json()) as { access_token?: string; refresh_token?: string };

      if (!payload.access_token || !payload.refresh_token) {
        throw new Error('Access token or refresh token not returned by Keycloak.');
      }

      return {
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token,
      };
    } catch (err: any) {
      console.error('Error issuing access token in Keycloak:', err.message || err);
      throw new Error(`Failed to login in Keycloak: ${err.message || err}`);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const baseUrl = process.env.KEYCLOAK_BASE_URL;
    const realm = process.env.KEYCLOAK_REALM;
    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    if (!baseUrl || !realm || !clientId) {
      throw new Error('KEYCLOAK_BASE_URL, KEYCLOAK_REALM, and KEYCLOAK_CLIENT_ID are required.');
    }

    const logoutUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/logout`;
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
    });

    if (clientSecret) {
      body.append('client_secret', clientSecret);
    }

    try {
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status ${response.status}: ${errorText}`);
      }
    } catch (err: any) {
      console.error('Error logging out in Keycloak:', err.message || err);
      throw new Error(`Failed to logout in Keycloak: ${err.message || err}`);
    }
  }
}
