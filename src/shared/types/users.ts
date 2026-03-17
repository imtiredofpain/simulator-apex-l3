export interface IUserLogin {
  login: string;
  password: string;
}

export interface IUser {
  firstName: string | null;
  id: number;
  lastName: string | null;
  login: string;
  patronymic: string | null;
  roleId: number;
}

// export interface ICreateUser extends Omit<IUser, "id"> {}

// export interface IUpdateUser extends Omit<IUser, "id"> {}

export interface IResponseUserSessionCheck {
  session: {
    isValid: boolean;
    updateAt: string;
    token: string;
  };
}
