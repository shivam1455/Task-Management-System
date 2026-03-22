const express = require("express");
const { Task, Comment, User } = require("../models");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  isNonEmptyString,
  normalizeString,
  isValidTaskStatus,
  isValidTaskPriority,
  isValidPositiveInteger,
} = require("../utils/validators");
const { sendError } = require("../utils/http");

const router = express.Router();

router.use(verifyToken);

function canAccessTask(task, user) {
  return user.role === "admin" || task.assigned_to === user.id;
}

// Admin: create task
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, description, assigned_to, priority, status, due_date } = req.body;
    const normalizedTitle = normalizeString(title);
    const normalizedDescription =
      typeof description === "string" ? normalizeString(description) : null;
    const normalizedPriority =
      typeof priority === "string" ? normalizeString(priority) : "medium";
    const normalizedStatus =
      typeof status === "string" ? normalizeString(status) : "pending";
    const normalizedDueDate =
      due_date === null || due_date === undefined || due_date === ""
        ? null
        : due_date;

    if (!isNonEmptyString(normalizedTitle)) {
      return sendError(res, 400, "title is required");
    }
    if (!isValidTaskPriority(normalizedPriority)) {
      return sendError(res, 400, "priority must be low, medium, or high");
    }
    if (!isValidTaskStatus(normalizedStatus)) {
      return sendError(res, 400, "status must be pending, in_progress, or completed");
    }
    if (normalizedDueDate && Number.isNaN(Date.parse(normalizedDueDate))) {
      return sendError(res, 400, "due_date must be a valid date");
    }
    if (
      assigned_to !== null &&
      assigned_to !== undefined &&
      !isValidPositiveInteger(Number(assigned_to))
    ) {
      return sendError(res, 400, "assigned_to must be a valid user id");
    }

    const assigneeId =
      assigned_to === null || assigned_to === undefined || assigned_to === ""
        ? null
        : Number(assigned_to);

    if (assigneeId !== null) {
      const assignee = await User.findByPk(assigneeId, { attributes: ["id"] });
      if (!assignee) {
        return sendError(res, 400, "Assigned user not found");
      }
    }

    const task = await Task.create({
      title: normalizedTitle,
      description: normalizedDescription,
      assigned_to: assigneeId,
      priority: normalizedPriority,
      status: normalizedStatus,
      due_date: normalizedDueDate,
    });

    return res.status(201).json(task);
  } catch (error) {
    return sendError(res, 500, "Failed to create task", error.message);
  }
});

// User/Admin: view tasks
// Admin sees all tasks, user sees only assigned tasks.
router.get("/", async (req, res) => {
  try {
    const whereClause = req.user.role === "admin" ? {} : { assigned_to: req.user.id };
    const tasks = await Task.findAll({ where: whereClause });
    return res.status(200).json(tasks);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch tasks", error.message);
  }
});

// User/Admin: view only tasks assigned to current user
router.get("/my", async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { assigned_to: req.user.id } });
    return res.status(200).json(tasks);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch assigned tasks", error.message);
  }
});

// Admin: edit any task
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!isValidPositiveInteger(taskId)) {
      return sendError(res, 400, "Invalid task id");
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const { title, description, assigned_to, priority, status, due_date } = req.body;
    const nextTitle = typeof title === "string" ? normalizeString(title) : task.title;
    const nextDescription =
      typeof description === "string" ? normalizeString(description) : task.description;
    const nextPriority =
      typeof priority === "string" ? normalizeString(priority) : task.priority;
    const nextStatus = typeof status === "string" ? normalizeString(status) : task.status;
    const nextDueDate =
      due_date === undefined ? task.due_date : due_date === "" ? null : due_date;
    const nextAssignedTo =
      assigned_to === undefined || assigned_to === ""
        ? task.assigned_to
        : assigned_to === null
          ? null
          : Number(assigned_to);

    if (!isNonEmptyString(nextTitle)) {
      return sendError(res, 400, "title cannot be empty");
    }
    if (!isValidTaskPriority(nextPriority)) {
      return sendError(res, 400, "priority must be low, medium, or high");
    }
    if (!isValidTaskStatus(nextStatus)) {
      return sendError(res, 400, "status must be pending, in_progress, or completed");
    }
    if (nextDueDate && Number.isNaN(Date.parse(nextDueDate))) {
      return sendError(res, 400, "due_date must be a valid date");
    }
    if (nextAssignedTo !== null && !isValidPositiveInteger(nextAssignedTo)) {
      return sendError(res, 400, "assigned_to must be a valid user id");
    }

    if (nextAssignedTo !== null) {
      const assignee = await User.findByPk(nextAssignedTo, { attributes: ["id"] });
      if (!assignee) {
        return sendError(res, 400, "Assigned user not found");
      }
    }

    await task.update({
      title: nextTitle,
      description: nextDescription,
      assigned_to: nextAssignedTo,
      priority: nextPriority,
      status: nextStatus,
      due_date: nextDueDate,
    });

    return res.status(200).json(task);
  } catch (error) {
    return sendError(res, 500, "Failed to update task", error.message);
  }
});

// Admin: delete any task
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!isValidPositiveInteger(taskId)) {
      return sendError(res, 400, "Invalid task id");
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    await task.destroy();
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return sendError(res, 500, "Failed to delete task", error.message);
  }
});

// User: update only status of their assigned task
// Admin can also update status.
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const normalizedStatus = typeof status === "string" ? normalizeString(status) : "";
    if (!isValidTaskStatus(normalizedStatus)) {
      return sendError(res, 400, "status must be pending, in_progress, or completed");
    }

    const taskId = Number(req.params.id);
    if (!isValidPositiveInteger(taskId)) {
      return sendError(res, 400, "Invalid task id");
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    if (!canAccessTask(task, req.user)) {
      return sendError(res, 403, "Not allowed to update this task");
    }

    task.status = normalizedStatus;
    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return sendError(res, 500, "Failed to update task status", error.message);
  }
});

// User/Admin: view comments for an accessible task
router.get("/:id/comments", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!isValidPositiveInteger(taskId)) {
      return sendError(res, 400, "Invalid task id");
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    if (!canAccessTask(task, req.user)) {
      return sendError(res, 403, "Not allowed to view comments");
    }

    const comments = await Comment.findAll({
      where: { task_id: task.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(comments);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch comments", error.message);
  }
});

// User/Admin: add comment to an accessible task
router.post("/:id/comments", async (req, res) => {
  try {
    const { content } = req.body;
    const normalizedContent = normalizeString(content);
    if (!isNonEmptyString(normalizedContent)) {
      return sendError(res, 400, "content is required");
    }
    if (normalizedContent.length > 1000) {
      return sendError(res, 400, "content must be 1000 characters or fewer");
    }

    const taskId = Number(req.params.id);
    if (!isValidPositiveInteger(taskId)) {
      return sendError(res, 400, "Invalid task id");
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    if (!canAccessTask(task, req.user)) {
      return sendError(res, 403, "Not allowed to comment on this task");
    }

    const comment = await Comment.create({
      task_id: task.id,
      user_id: req.user.id,
      content: normalizedContent,
    });

    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(201).json(createdComment);
  } catch (error) {
    return sendError(res, 500, "Failed to add comment", error.message);
  }
});

module.exports = router;
