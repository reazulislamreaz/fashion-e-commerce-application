const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Simple replace of any <button that doesn't have cursor-pointer inside its className
            // To handle newlines, we'll just inject cursor-pointer into className if it exists,
            // or add className="cursor-pointer" if it doesn't.
            
            const buttonRegex = /<button\b([^>]*?)>/g;
            content = content.replace(buttonRegex, (match, p1) => {
                if (match.includes('cursor-pointer')) {
                    return match;
                }

                if (p1.includes('className=')) {
                    // Inject cursor-pointer into the className string
                    const classMatch = p1.match(/className=(["'])(.*?)\1/s);
                    if (classMatch) {
                        const newClassName = `className="${classMatch[2]} cursor-pointer"`;
                        updated = true;
                        return match.replace(classMatch[0], newClassName);
                    }
                }
                
                updated = true;
                return `<button className="cursor-pointer"${p1}>`;
            });
            
            // Clean up duplicates if they happened from the previous run
            content = content.replace(/className="cursor-pointer"\s+className=/g, 'className="cursor-pointer ');

            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'frontend/src/app/dashboard'));
processDir(path.join(__dirname, 'frontend/src/components/dashboard'));
