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

            // 1. Fix double classNames introduced by previous script
            const doubleClassRegex = /<button\s+className="cursor-pointer"\s+([^>]*?)className=(["'])(.*?)\2/g;
            content = content.replace(doubleClassRegex, (match, p1, quote, classStr) => {
                updated = true;
                const newClass = classStr.includes('cursor-pointer') ? classStr : `${classStr} cursor-pointer`;
                return `<button ${p1}className=${quote}${newClass}${quote}`;
            });

            // 2. Fix other buttons that might have two classNames in a different order
            const doubleClassRegex2 = /<button\s+([^>]*?)className=(["'])(.*?)\2([^>]*?)className="cursor-pointer"/g;
            content = content.replace(doubleClassRegex2, (match, p1, quote, classStr, p4) => {
                updated = true;
                const newClass = classStr.includes('cursor-pointer') ? classStr : `${classStr} cursor-pointer`;
                return `<button ${p1}className=${quote}${newClass}${quote}${p4}`;
            });

            // 3. Make sure any remaining <button ...> that doesn't have cursor-pointer gets it
            const buttonRegex = /<button\b([^>]*?)>/g;
            content = content.replace(buttonRegex, (match, p1) => {
                if (match.includes('cursor-pointer')) return match;
                
                if (p1.includes('className=')) {
                    // Inject cursor-pointer into the className string
                    const classMatch = p1.match(/className=(["'])(.*?)\1/);
                    if (classMatch) {
                        const newClassName = `className="${classMatch[2]} cursor-pointer"`;
                        updated = true;
                        return match.replace(classMatch[0], newClassName);
                    }
                }
                
                updated = true;
                return `<button className="cursor-pointer"${p1}>`;
            });
            
            // Clean up any weird spaces
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
