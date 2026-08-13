require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432)
});

// Middleware
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


/*
==================================================
VALIDATION FUNCTION
==================================================
*/

function validateStudent(body) {

    const requiredFields = [
        "name",
        "father_name",
        "email",
        "phone",
        "date_of_birth",
        "gender",
        "course",
        "address"
    ];

    for (const field of requiredFields) {

        if (
            !body[field] ||
            String(body[field]).trim() === ""
        ) {

            return `${field} is required`;
        }
    }

    return null;
}


/*
==================================================
TEST ROUTE
==================================================
*/

app.get("/api/test", (req, res) => {

    res.json({
        message: "Student API is working"
    });

});


/*
==================================================
READ ALL STUDENTS
GET /api/students
==================================================
*/

app.get("/api/students", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT *
            FROM students
            ORDER BY id DESC
            `
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch students"
        });

    }

});


/*
==================================================
READ ONE STUDENT
GET /api/students/:id
==================================================
*/

app.get("/api/students/:id", async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT *
            FROM students
            WHERE id = $1
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Student not found"
            });

        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch student"
        });

    }

});


/*
==================================================
CREATE STUDENT
POST /api/students
==================================================
*/

app.post("/api/students", async (req, res) => {

    const validationError = validateStudent(req.body);

    if (validationError) {

        return res.status(400).json({
            error: validationError
        });

    }

    const {
        name,
        father_name,
        email,
        phone,
        date_of_birth,
        gender,
        course,
        address,
        admission_date
    } = req.body;


    try {

        const result = await pool.query(
            `
            INSERT INTO students
            (
                name,
                father_name,
                email,
                phone,
                date_of_birth,
                gender,
                course,
                address,
                admission_date
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                COALESCE($9::date, CURRENT_DATE)
            )

            RETURNING *
            `,
            [
                name.trim(),
                father_name.trim(),
                email.trim(),
                phone.trim(),
                date_of_birth,
                gender,
                course,
                address.trim(),
                admission_date || null
            ]
        );


        res.status(201).json(result.rows[0]);


    } catch (error) {

        console.error(error);


        // Duplicate email
        if (error.code === "23505") {

            return res.status(409).json({
                error: "Email already exists"
            });

        }


        res.status(500).json({
            error: "Failed to create student"
        });

    }

});


/*
==================================================
UPDATE STUDENT
PUT /api/students/:id
==================================================
*/

app.put("/api/students/:id", async (req, res) => {

    const validationError = validateStudent(req.body);

    if (validationError) {

        return res.status(400).json({
            error: validationError
        });

    }


    const {
        name,
        father_name,
        email,
        phone,
        date_of_birth,
        gender,
        course,
        address,
        admission_date
    } = req.body;


    try {

        const result = await pool.query(
            `
            UPDATE students

            SET
                name = $1,
                father_name = $2,
                email = $3,
                phone = $4,
                date_of_birth = $5,
                gender = $6,
                course = $7,
                address = $8,
                admission_date = COALESCE($9::date, admission_date),
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $10

            RETURNING *
            `,
            [
                name.trim(),
                father_name.trim(),
                email.trim(),
                phone.trim(),
                date_of_birth,
                gender,
                course,
                address.trim(),
                admission_date || null,
                req.params.id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Student not found"
            });

        }


        res.json(result.rows[0]);


    } catch (error) {

        console.error(error);


        if (error.code === "23505") {

            return res.status(409).json({
                error: "Email already exists"
            });

        }


        res.status(500).json({
            error: "Failed to update student"
        });

    }

});


/*
==================================================
DELETE STUDENT
DELETE /api/students/:id
==================================================
*/

app.delete("/api/students/:id", async (req, res) => {

    try {

        const result = await pool.query(
            `
            DELETE FROM students
            WHERE id = $1
            RETURNING id
            `,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Student not found"
            });

        }


        res.json({
            message: "Student deleted successfully"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to delete student"
        });

    }

});


/*
==================================================
START SERVER
==================================================
*/

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});