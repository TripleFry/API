import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';



const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));



    const jsonString = fs.readFileSync('./subjects.json', 'utf-8');
    const courseData = JSON.parse(jsonString);
    console.log(courseData);


const isValidFilter = (value) => value !== undefined && value !== '';
console.log(courseData);

app.get("/filter", (req,res) => {
    const {
        subject,
        difficultyLevel,
        contentType,
        format,
        language,
        certification,
        totalHours
    } = req.query;

    // Start with all courses
    let filteredCourses = courseData.courses;

    // Apply each filter only if it exists
    if (isValidFilter(subject)) {
        filteredCourses = filteredCourses.filter((course) => 
            course.subject.toLowerCase() === subject.toLowerCase()
        );
    }

    if (isValidFilter(difficultyLevel)) {
        filteredCourses = filteredCourses.filter(course => 
            course.difficultyLevel.toLowerCase() === difficultyLevel.toLowerCase()
        );
    }

    if (isValidFilter(contentType)) {
        filteredCourses = filteredCourses.filter(course => 
            course.contentType.toLowerCase() === contentType.toLowerCase()
        );
    }

    if (isValidFilter(format)) {
        filteredCourses = filteredCourses.filter(course => 
            course.format.toLowerCase() === format.toLowerCase()
        );
    }

    if (isValidFilter(language)) {
        filteredCourses = filteredCourses.filter(course => 
            course.language.toLowerCase() === language.toLowerCase()
        );
    }

    if (isValidFilter(totalHours)) {
        filteredCourses = filteredCourses.filter(course => 
            course.totalHours === totalHours
        );
    }

    // For boolean filters like certification
    if (isValidFilter(certification)) {
        filteredCourses = filteredCourses.filter(course => 
            course.certification === (certification.toLowerCase() === 'true')
        );
    }
    res.json({
        success: true,
        data: filteredCourses
    });
})

app.post("/addNew",(req,res) => {

    try {
        // Destructure with default values and type checking
        const {
            subject = '',
            subCategory = '',
            title = '',
            difficultyLevel = '',
            contentType = '',
            format = '',
            duration = '',
            totalHours = 0,
            language = ''
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'subject', 'subCategory', 'title', 'difficultyLevel', 
            'contentType', 'format', 'duration', 'totalHours', 'language'
        ];

        const missingFields = requiredFields.filter(field => 
            !req.body[field] || req.body[field].toString().trim() === ''
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Generate course ID safely
        const courseId = subject && subject.length > 0 
            ? `${subject.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 999)}`
            : `COURSE${Math.floor(Math.random() * 9999)}`;

        const newCourse = {
            id: courseId,
            subject,
            subCategory,
            title,
            difficultyLevel,
            contentType,
            format,
            duration,
            totalHours: parseInt(totalHours),
            language,
            tags: req.body.tags || [],
            prerequisites: req.body.prerequisites || [],
            certification: req.body.certification || false,
            rating: 0,
            enrollmentCount: 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            features: {
                hasQuizzes: req.body.features?.hasQuizzes || false,
                hasPracticeExercises: req.body.features?.hasPracticeExercises || false,
                hasProjectAssignments: req.body.features?.hasProjectAssignments || false,
                hasDiscussionForums: req.body.features?.hasDiscussionForums || false,
                hasPeerReview: req.body.features?.hasPeerReview || false
            }
        };

        // Read existing data
        const filePath = join(dirname(fileURLToPath(import.meta.url)), 'courses.json');
        const jsonData = readFile(filePath, 'utf8');
        const data = JSON.parse(jsonData);

        // Add new course
        data.courses.push(newCourse);

        // Write updated data back to file
        writeFile(filePath, JSON.stringify(data, null, 2));

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: newCourse
        });

    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
})

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))