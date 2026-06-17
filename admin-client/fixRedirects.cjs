const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/NITRO V/OneDrive/Documents/Desktop/ai-interview/GLAMIS/admin-client/src/components/dashboard/scheduleInterview';

const files = [
    'CompanyInterview.jsx',
    'SubjectInterview.jsx',
    'SwarInterview.jsx',
    'VerbalInterview.jsx',
    'WrittenInterview.jsx'
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import useNavigate
    if (!content.includes('useNavigate')) {
        content = content.replace(
            /import React(.*?);\n/,
            "import React$1;\nimport { useNavigate } from 'react-router-dom';\n"
        );
    }

    // Add const navigate = useNavigate(); inside the component
    const componentRegex = /(export default function \w+\(\) {\n\s*)(const \[[a-zA-Z]+, set[a-zA-Z]+\] = useState)/;
    if (!content.includes('const navigate = useNavigate()')) {
        content = content.replace(
            componentRegex,
            "$1const navigate = useNavigate();\n    $2"
        );
    }

    // Add navigate('/admin/review-board'); after alert or toast
    const submitRegex = /(alert\(['"]Interview Created successfully['"]\);?\n?)(.*?)} catch/s;
    if (!content.includes("navigate('/admin/review-board')")) {
        content = content.replace(
            submitRegex,
            "$1            navigate('/admin/review-board');\n$2} catch"
        );
    }
    
    // Also add to console.log("Form submitted successfully:", response.data); if alert doesn't exist
    if (!content.includes("navigate('/admin/review-board')")) {
        content = content.replace(
            /(console\.log\(['"]Form submitted successfully:['"], response\.data\);?\n?)/,
            "$1            navigate('/admin/review-board');\n"
        );
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
