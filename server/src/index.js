const express = require('express');
const cors = require('cors');
const mcpRoutes = require('./routes/mcp');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/mcp', mcpRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));