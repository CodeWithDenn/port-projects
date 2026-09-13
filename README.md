# Portfolio Project Structure

This portfolio is organized to make it easy to add more projects and pages in the future.

## Structure

portfolio/
├── index.html
├── README.md
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── script.js
└── projects/
    ├── README.md
    └── project-template/
        └── index.html

## How to add a new project

1. Create a new folder inside `projects/` using the project name.
2. Add a page such as `index.html` for that project.
3. Link it from the main portfolio homepage.
4. Keep shared styling and scripts in `assets/`.

## Future-proofing notes

- Keep reusable styles in `assets/css/`.
- Keep reusable JavaScript in `assets/js/`.
- Add each project as a separate folder in `projects/`.
- Use consistent naming across all project pages.
