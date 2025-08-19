import { roleEnum } from "../../DB/models/user.model.js";

export const endPoint = {
    profile: [roleEnum.admin, roleEnum.user],
    restoreAccount: [roleEnum.admin],
    hardDeleteAccount: [roleEnum.admin]
}