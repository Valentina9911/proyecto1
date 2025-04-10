const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express(); 
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";
let refreshTokens = [];

// Generar tokens
const generateAccessToken = (user) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);
    return refreshToken;
};

// Ruta de login
app.post('/api/login', (req, res) => {
    console.log('Datos recibidos:', req.body);
    const { usuario, password } = req.body;

 // Solo números
 if (!/^\d+$/.test(usuario)) {
    return res.status(400).json({ error: "El usuario solo debe contener números" });
}  

    if ((usuario === "1234" && password === "123456") || (usuario === "5500" && password === "5252")) {
        const user = { usuario };
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({ accessToken, refreshToken });
    } else {
        return res.status(401).json({ error: "Datos incorrectos" });
    }
});

// Refresh token
app.post('/api/token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: "Denegado" });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = generateAccessToken({ usuario: user.usuario });
        res.json({ accessToken: newAccessToken });
    });
});


app.post('/api/logout', (req, res) => {
    const { refreshToken } = req.body;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.json({ message: "Sesión cerrada" });
});


app.get('/', (req, res) => {
    res.send('Backend funcionando');
});


app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
