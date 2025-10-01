import { GoogleGenerativeAI } from '@google/generative-ai';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Note from '../models/Note.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Function Declarations ---
const tools = [
    {
        functionDeclarations: [
            // Project functions
            {
                name: 'createProject',
                description: 'Create a new project for the user.',
                parameters: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        color: { type: 'string' },
                    },
                    required: ['name'],
                },
            },
            {
                name: 'getProjects',
                description: 'Get all projects for the user.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'updateProject',
                description: 'Update a project by ID.',
                parameters: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        color: { type: 'string' },
                        isFavorite: { type: 'boolean' },
                    },
                    required: ['id'],
                },
            },
            {
                name: 'deleteProject',
                description: 'Delete a project by ID.',
                parameters: {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                    required: ['id'],
                },
            },

            // Task functions
            {
                name: 'createTask',
                description: 'Create a new task in inbox project.',
                parameters: {
                    type: 'object',
                    properties: {
                        content: { type: 'string' },
                        description: { type: 'string' },
                        projectId: { type: 'string' },
                        priority: { type: 'number' },
                        dueDate: { type: 'string' },
                    },
                    required: ['content', 'projectId'],
                },
            },
            {
                name: 'getTasks',
                description: 'Get all tasks for the user.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'updateTask',
                description: 'Update a task by ID.',
                parameters: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        content: { type: 'string' },
                        description: { type: 'string' },
                        priority: { type: 'number' },
                        dueDate: { type: 'string' },
                        isCompleted: { type: 'boolean' },
                    },
                    required: ['id'],
                },
            },
            {
                name: 'deleteTask',
                description: 'Delete a task by ID.',
                parameters: {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                    required: ['id'],
                },
            },

            // Note functions
            {
                name: 'createNote',
                description: 'Create a new note for the user.',
                parameters: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        content: { type: 'string' },
                    },
                    required: ['title', 'content'],
                },
            },
            {
                name: 'getNotes',
                description: 'Get all notes for the user.',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'updateNote',
                description: 'Update a note by ID.',
                parameters: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                    },
                    required: ['id'],
                },
            },
            {
                name: 'deleteNote',
                description: 'Delete a note by ID.',
                parameters: {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                    required: ['id'],
                },
            },
        ],
    },
];

// --- Chat Controller ---
export const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.user._id;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', tools });
        const chat = model.startChat({ history: history || [] });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            let functionResponse;

            // --- Projects ---
            if (call.name === 'createProject') {
                const { name, color } = call.args;
                const project = await Project.create({ name, color, userId });
                functionResponse = { functionResponse: { name: 'createProject', response: { success: true, project } } };
            } else if (call.name === 'getProjects') {
                const projects = await Project.find({ userId });
                functionResponse = { functionResponse: { name: 'getProjects', response: { projects } } };
            } else if (call.name === 'updateProject') {
                const { id, ...updates } = call.args;
                const project = await Project.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
                functionResponse = { functionResponse: { name: 'updateProject', response: { success: true, project } } };
            } else if (call.name === 'deleteProject') {
                const { id } = call.args;
                await Project.deleteOne({ _id: id, userId });
                functionResponse = { functionResponse: { name: 'deleteProject', response: { success: true } } };
            }

            // --- Tasks ---
            else if (call.name === 'createTask') {
                const { content, description, projectId, priority, dueDate } = call.args;
                const task = await Task.create({ content, description, projectId, priority, dueDate, ownerId: userId });
                functionResponse = { functionResponse: { name: 'createTask', response: { success: true, task } } };
            } else if (call.name === 'getTasks') {
                const tasks = await Task.find({ ownerId: userId });
                functionResponse = { functionResponse: { name: 'getTasks', response: { tasks } } };
            } else if (call.name === 'updateTask') {
                const { id, ...updates } = call.args;
                const task = await Task.findOneAndUpdate({ _id: id, ownerId: userId }, updates, { new: true });
                functionResponse = { functionResponse: { name: 'updateTask', response: { success: true, task } } };
            } else if (call.name === 'deleteTask') {
                const { id } = call.args;
                await Task.deleteOne({ _id: id, ownerId: userId });
                functionResponse = { functionResponse: { name: 'deleteTask', response: { success: true } } };
            }

            // --- Notes ---
            else if (call.name === 'createNote') {
                const { title, content } = call.args;
                const note = await Note.create({ title, content, ownerId: userId });
                functionResponse = { functionResponse: { name: 'createNote', response: { success: true, note } } };
            } else if (call.name === 'getNotes') {
                const notes = await Note.find({ ownerId: userId });
                functionResponse = { functionResponse: { name: 'getNotes', response: { notes } } };
            } else if (call.name === 'updateNote') {
                const { id, ...updates } = call.args;
                const note = await Note.findOneAndUpdate({ _id: id, ownerId: userId }, updates, { new: true });
                functionResponse = { functionResponse: { name: 'updateNote', response: { success: true, note } } };
            } else if (call.name === 'deleteNote') {
                const { id } = call.args;
                await Note.deleteOne({ _id: id, ownerId: userId });
                functionResponse = { functionResponse: { name: 'deleteNote', response: { success: true } } };
            }

            if (functionResponse) {
                const result2 = await chat.sendMessage([functionResponse]);
                return res.json({ reply: result2.response.text() });
            }
        }

        // --- No function call ---
        return res.json({ reply: response.text() });
    } catch (error) {
        console.error('AI chat failed:', error);
        res.status(500).json({ message: 'AI chat failed', error });
    }
};

