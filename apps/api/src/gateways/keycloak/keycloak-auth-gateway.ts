import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { AuthUser, IAuthGateway } from '../../contracts/gateways/auth-gateway';

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

    // 4. Find 'user' client role
    let userRole: any;
    try {
      const clientRoles = await this.kcAdminClient.clients.listRoles({
        id: clientUuid,
      });

      const foundRole = clientRoles.find((role) => role.name === 'user');
      if (!foundRole) {
        throw new Error(`Role 'user' not found under client '${clientIdName}'.`);
      }
      userRole = foundRole;
    } catch (err: any) {
      console.error('Error finding client role in Keycloak:', err.message || err);
      throw new Error(`Failed to find client role in Keycloak: ${err.message || err}`);
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
}
