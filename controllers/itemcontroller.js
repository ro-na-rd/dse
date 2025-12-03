import { db } from "../config/db.js";

export const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const connection = await db.getConnection();

    try {
      const [result] = await connection.execute(
        "INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)" ,
        [userId, title, description || null]
      );
      res.status(201).json({ 
        message: "Todo created successfully", 
        id: result.insertId 
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodos = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const connection = await db.getConnection();

    try {
      const [todos] = await connection.execute(
        "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [userId, limit, offset]
      );

      const [countResult] = await connection.execute(
        "SELECT COUNT(*) as total FROM todos WHERE user_id = ?",
        [userId]
      );

      res.json({
        todos,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const userId = req.userId;

    const connection = await db.getConnection();

    try {
      // Verify ownership
      const [owner] = await connection.execute(
        "SELECT user_id FROM todos WHERE id = ?",
        [id]
      );

      if (owner.length === 0) {
        return res.status(404).json({ error: "Todo not found" });
      }

      if (owner[0].user_id !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await connection.execute(
        "UPDATE todos SET title = COALESCE(?, title), description = COALESCE(?, description), completed = COALESCE(?, completed) WHERE id = ?",
        [title || null, description || null, completed !== undefined ? completed : null, id]
      );

      res.json({ message: "Todo updated successfully" });
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const connection = await db.getConnection();

    try {
      // Verify ownership
      const [owner] = await connection.execute(
        "SELECT user_id FROM todos WHERE id = ?",
        [id]
      );

      if (owner.length === 0) {
        return res.status(404).json({ error: "Todo not found" });
      }

      if (owner[0].user_id !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await connection.execute("DELETE FROM todos WHERE id = ?", [id]);

      res.json({ message: "Todo deleted successfully" });
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};