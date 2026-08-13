// ==========================================
// GET HTML ELEMENTS
// ==========================================

const form =
    document.getElementById("studentForm");

const studentId =
    document.getElementById("studentId");

const formTitle =
    document.getElementById("formTitle");

const submitButton =
    document.getElementById("submitButton");

const cancelButton =
    document.getElementById("cancelButton");

const message =
    document.getElementById("message");

const tableBody =
    document.getElementById("studentTableBody");

const searchInput =
    document.getElementById("searchInput");


// ==========================================
// STORE STUDENTS
// ==========================================

let students = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Set today's date

        document.getElementById(
            "admission_date"
        ).value =
            new Date()
                .toISOString()
                .split("T")[0];


        // Load students

        loadStudents();

    }
);


// ==========================================
// CREATE / UPDATE
// ==========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // Get form data

        const data = {

            name:
                document.getElementById(
                    "name"
                ).value,

            father_name:
                document.getElementById(
                    "father_name"
                ).value,

            email:
                document.getElementById(
                    "email"
                ).value,

            phone:
                document.getElementById(
                    "phone"
                ).value,

            date_of_birth:
                document.getElementById(
                    "date_of_birth"
                ).value,

            gender:
                document.getElementById(
                    "gender"
                ).value,

            course:
                document.getElementById(
                    "course"
                ).value,

            address:
                document.getElementById(
                    "address"
                ).value,

            admission_date:
                document.getElementById(
                    "admission_date"
                ).value

        };


        // Check whether this is
        // CREATE or UPDATE

        const id =
            studentId.value;


        let method;

        let url;


        if (id) {

            // UPDATE

            method = "PUT";

            url =
                `/api/students/${id}`;

        } else {

            // CREATE

            method = "POST";

            url =
                "/api/students";

        }


        try {

            const response =
                await fetch(
                    url,
                    {

                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Something went wrong"
                );

            }


            // Success message

            if (id) {

                showMessage(
                    "Student updated successfully.",
                    "success"
                );

            } else {

                showMessage(
                    "Student added successfully.",
                    "success"
                );

            }


            // Clear form

            resetForm();


            // Reload students

            loadStudents();


        } catch (error) {

            showMessage(
                error.message,
                "error"
            );

        }

    }
);


// ==========================================
// CANCEL EDIT
// ==========================================

cancelButton.addEventListener(
    "click",
    resetForm
);


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    () => {

        renderStudents(
            searchInput.value
        );

    }
);


// ==========================================
// READ ALL STUDENTS
// ==========================================

async function loadStudents() {

    try {

        const response =
            await fetch(
                "/api/students"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to load students"
            );

        }


        students = data;


        renderStudents();


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// DISPLAY STUDENTS
// ==========================================

function renderStudents(
    search = ""
) {

    const keyword =
        search
            .toLowerCase()
            .trim();


    const filtered =
        students.filter(
            student => {

                return [

                    student.name,

                    student.father_name,

                    student.email,

                    student.phone,

                    student.course

                ].some(
                    value =>
                        String(value)
                            .toLowerCase()
                            .includes(keyword)
                );

            }
        );


    // Clear table

    tableBody.innerHTML = "";


    // No students

    if (filtered.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }


    // Add students

    filtered.forEach(
        student => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${student.id}
                </td>

                <td>
                    ${escapeHtml(student.name)}
                </td>

                <td>
                    ${escapeHtml(student.father_name)}
                </td>

                <td>
                    ${escapeHtml(student.email)}
                </td>

                <td>
                    ${escapeHtml(student.phone)}
                </td>

                <td>
                    ${escapeHtml(student.course)}
                </td>

                <td>
                    ${formatDate(
                        student.admission_date
                    )}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="edit"
                            onclick="editStudent(${student.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="delete"
                            onclick="deleteStudent(${student.id})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );

}


// ==========================================
// EDIT STUDENT
// ==========================================

async function editStudent(id) {

    try {

        const response =
            await fetch(
                `/api/students/${id}`
            );


        const student =
            await response.json();


        if (!response.ok) {

            throw new Error(
                student.error ||
                "Failed to load student"
            );

        }


        // Put ID into hidden input

        studentId.value =
            student.id;


        // Fill form

        document.getElementById(
            "name"
        ).value =
            student.name;


        document.getElementById(
            "father_name"
        ).value =
            student.father_name;


        document.getElementById(
            "email"
        ).value =
            student.email;


        document.getElementById(
            "phone"
        ).value =
            student.phone;


        document.getElementById(
            "date_of_birth"
        ).value =
            formatDateForInput(
                student.date_of_birth
            );


        document.getElementById(
            "gender"
        ).value =
            student.gender;


        document.getElementById(
            "course"
        ).value =
            student.course;


        document.getElementById(
            "address"
        ).value =
            student.address;


        document.getElementById(
            "admission_date"
        ).value =
            formatDateForInput(
                student.admission_date
            );


        // Change form to UPDATE mode

        formTitle.textContent =
            "Edit Student";


        submitButton.textContent =
            "Update Student";


        cancelButton.classList.remove(
            "hidden"
        );


        // Scroll to form

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(id) {

    const student =
        students.find(
            student =>
                student.id === id
        );


    if (!student) {

        return;

    }


    const confirmed =
        confirm(
            `Delete student "${student.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to delete student"
            );

        }


        showMessage(
            "Student deleted successfully.",
            "success"
        );


        loadStudents();


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    form.reset();


    studentId.value = "";


    document.getElementById(
        "admission_date"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    formTitle.textContent =
        "Add Student";


    submitButton.textContent =
        "Add Student";


    cancelButton.classList.add(
        "hidden"
    );

}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    if (type === "error") {

        message.style.color =
            "#dc2626";

    } else {

        message.style.color =
            "#16a34a";

    }


    setTimeout(
        () => {

            message.textContent =
                "";

        },
        4000
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {

    if (!value) {

        return "";

    }


    return new Date(
        value
    ).toLocaleDateString();

}


// ==========================================
// FORMAT DATE FOR INPUT
// ==========================================

function formatDateForInput(
    value
) {

    if (!value) {

        return "";

    }


    return String(value)
        .substring(0, 10);

}


// ==========================================
// SECURITY: ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}0