import express from 'express';
import Joi from 'joi';
import { pool } from '../db/pool.js';
import { haversineDistance } from '../utils/haversine.js';

const router = express.Router();

// Validation schemas
const addSchoolSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  address: Joi.string().trim().min(1).max(500).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

// POST /addSchool
router.post('/addSchool', async (req, res) => {
  try {
    const { error, value } = addSchoolSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { name, address, latitude, longitude } = value;

    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    const insertedId = result.insertId;

    const [rows] = await pool.execute('SELECT * FROM schools WHERE id = ?', [insertedId]);

    return res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error in /addSchool:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /listSchools?lat=..&lng=..
const listSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required()
});

router.get('/listSchools', async (req, res) => {
  try {
    const { error, value } = listSchema.validate(req.query, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const userLat = Number(value.lat);
    const userLng = Number(value.lng);

    const [rows] = await pool.execute('SELECT * FROM schools');

    const withDistances = rows.map(row => {
      const distance_km = haversineDistance(userLat, userLng, row.latitude, row.longitude);
      return { ...row, distance_km: Number(distance_km.toFixed(3)) };
    });

    withDistances.sort((a, b) => a.distance_km - b.distance_km);

    return res.json({
      success: true,
      count: withDistances.length,
      data: withDistances
    });
  } catch (err) {
    console.error('Error in /listSchools:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;