export class User {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;

  constructor(props: Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & Partial<User>) {
    Object.assign(this, props);
  }
}
