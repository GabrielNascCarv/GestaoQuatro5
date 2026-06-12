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
    const createdUser = await this.kcAdminClient.users.create({
      username: user.email,
      email: user.email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true,
    });

    const keycloakId = createdUser.id;
    if (!keycloakId) {
      throw new Error('Failed to create user in Keycloak: ID not returned.');
    }

    // 2. Set password (non-temporary)
    if (user.password) {
      await this.kcAdminClient.users.resetPassword({
        id: keycloakId,
        credential: {
          type: 'password',
          value: user.password,
          temporary: false,
        },
      });
    }

    // 3. Find client UUID
    const clientIdName = process.env.KEYCLOAK_CLIENT_ID;
    const clients = await this.kcAdminClient.clients.find({
      clientId: clientIdName,
    });

    const clientUuid = clients[0]?.id;
    if (!clientUuid) {
      throw new Error(`Client '${clientIdName}' not found in Keycloak.`);
    }

    // 4. Find 'operador' client role
    const clientRoles = await this.kcAdminClient.clients.listRoles({
      id: clientUuid,
    });

    const operadorRole = clientRoles.find((role) => role.name === 'operador');
    if (!operadorRole) {
      throw new Error(`Role 'operador' not found under client '${clientIdName}' in Keycloak.`);
    }

    // 5. Assign client role to user
    await this.kcAdminClient.users.addClientRoleMappings({
      id: keycloakId,
      clientUniqueId: clientUuid,
      roles: [
        {
          id: operadorRole.id!,
          name: operadorRole.name!,
        },
      ],
    });


    return { keycloakId };
  }
}
