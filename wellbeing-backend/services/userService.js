const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const schoolModel = require("../models/schoolModel"); // Needed to validate school existence

exports.createUser = async (data) => {
  // 1. Basic Validation
  if (!data.name || !data.username || !data.password || !data.role) {
    throw new Error(
      "BAD_REQUEST: name, username, password, and role are required",
    );
  }

  const validRoles = [
    "ngo_super_admin",
    "ngo_staff",
    "school_admin",
    "teacher",
  ];
  if (!validRoles.includes(data.role)) {
    throw new Error("BAD_REQUEST: Invalid role provided");
  }

  // 2. Role-Based School Logic
  let finalSchoolId = data.school_id;

  if (data.role === "ngo_super_admin" || data.role === "ngo_staff") {
    // NGO users cannot belong to a specific school
    finalSchoolId = null;
  } else {
    // School users MUST have a valid school_id
    if (!finalSchoolId) {
      throw new Error(
        `BAD_REQUEST: school_id is required for role: ${data.role}`,
      );
    }

    // Validate school exists
    const schoolExists = await schoolModel.findById(finalSchoolId);
    if (!schoolExists) {
      throw new Error(
        "BAD_REQUEST: Invalid school_id. The specified school does not exist.",
      );
    }
  }

  // Inside exports.createUser
  if (data.role === "teacher") {
    if (!data.classes || !Array.isArray(data.classes)) {
      throw new Error(
        "BAD_REQUEST: Teachers must have a classes array (can be empty)",
      );
    }
  }

  // 3. Hash the password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(data.password, saltRounds);

  // 4. Create the user
  const insertData = {
    ...data,
    school_id: finalSchoolId,
    password_hash,
  };

  const insertId = await userModel.create(insertData);

  // Return the new user without exposing the password hash
  return {
    id: insertId,
    name: data.name,
    username: data.username,
    role: data.role,
    school_id: finalSchoolId,
  };
};

exports.getAllUsers = async () => {
  return await userModel.findAll();
};

exports.getUserById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new Error("NOT_FOUND: User not found");
  }
  return user;
};

exports.updateUser = async (id, data) => {
  // Prevent updating to invalid roles
  if (data.role) {
    const validRoles = [
      "ngo_super_admin",
      "ngo_staff",
      "school_admin",
      "teacher",
    ];
    if (!validRoles.includes(data.role)) {
      throw new Error("BAD_REQUEST: Invalid role provided");
    }
  }

  let finalSchoolId = data.school_id;

  // If role or school_id is being updated, we must re-validate the rules
  if (data.role || finalSchoolId !== undefined) {
    // Fetch current user to know their existing role if not provided in update
    const currentUser = await userModel.findById(id);
    if (!currentUser) throw new Error("NOT_FOUND: User not found");

    const roleToCheck = data.role || currentUser.role;
    finalSchoolId =
      finalSchoolId !== undefined ? finalSchoolId : currentUser.school_id;

    if (roleToCheck === "ngo_super_admin" || roleToCheck === "ngo_staff") {
      finalSchoolId = null;
    } else {
      if (!finalSchoolId) {
        throw new Error(
          `BAD_REQUEST: school_id is required for role: ${roleToCheck}`,
        );
      }
      const schoolExists = await schoolModel.findById(finalSchoolId);
      if (!schoolExists) {
        throw new Error(
          "BAD_REQUEST: Invalid school_id. The specified school does not exist.",
        );
      }
    }
  }

  // Hash new password if provided in the update request
  let password_hash = undefined;
  if (data.password) {
    password_hash = await bcrypt.hash(data.password, 10);
  }

  const updateData = {
    ...data,
    school_id: finalSchoolId,
    password_hash,
  };

  const affectedRows = await userModel.update(id, updateData);
  if (affectedRows === 0) {
    throw new Error("NOT_FOUND: User not found or no changes made");
  }

  return { id, message: "User updated successfully" };
};

exports.deleteUser = async (id) => {
  const affectedRows = await userModel.delete(id);
  if (affectedRows === 0) {
    throw new Error("NOT_FOUND: User not found");
  }
  return true;
};
