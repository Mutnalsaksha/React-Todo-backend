const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Todo API');
});

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/todo_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const todoSchema = new mongoose.Schema({
    task: String,
    completed: Boolean
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/todos', async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

app.post('/todos', async (req, res) => {
    const newTodo = new Todo({
        task: req.body.task,
        completed: false
    });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
});

// app.put('/todos/:id', async (req, res) => {
//     const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updatedTodo);
// });

// PUT route to update a todo
app.put('/todos/:id', async (req, res) => {
    try {
        const todoId = req.params.id;
        
        // Check if the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(todoId)) {
            return res.status(400).send("Invalid Todo ID");
        }

        const { task,completed } = req.body;
        // Find and Update the todo item
        const updatedTodo = await Todo.findByIdAndUpdate(
            todoId,
            { task,completed },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).send("Todo not found");
        }
        res.status(200).send(updatedTodo);
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).send("Error updating the todo");
    }
});
  

// app.delete('/todos/:id', async (req, res) => {
//     await Todo.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Todo deleted' });
// });

app.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).send('Todo not found');
        }
        res.status(200).send(todo);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
