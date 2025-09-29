// controller/UserController.js
const UserModel = require("../model/UserModel");
const RoleUserModel = require("../model/RoleUserModel");

class UserController {
  static createAccount(req, res) {
    const { name, email, password, remember, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    UserModel.addUser({ name, email, password, remember, role });
    res.json({ success: "Account created successfully!" });
  }

  static listUsers(req, res) {
    res.json(UserModel.getUsers());
  }

  static listRoles(req, res) {
    res.json(RoleUserModel.getRoles());
  }
}

module.exports = UserController;
