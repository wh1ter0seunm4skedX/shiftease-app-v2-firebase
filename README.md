# **ShiftEase** 
_A full-stack solution for managing and registering for events._

---

## **Overview** 

**ShiftEase** is a full-stack web application designed to streamline event management and youth worker coordination in community centers. Whether you're scheduling events or tracking participation, this app provides an intuitive interface to keep admins and workers organized.  

Built with **React.js** on the frontend and **Firebase** for authentication and data management.  

---

## **Features** 

**User Authentication** – Secure login & role-based access control to manage permissions effectively.  
**Event Management** – Create, update, and delete events with detailed descriptions, times, and tasks.  
**Responsive Design** – Fully functional on desktop and **mobile** devices.  

---

## **Tech Stack**  

- **Frontend:** React.js 
- **Backend:** Firebase (Firestore, Firebase Auth)  
- **Hosting & Deployment:** GitHub Pages  
- **Styling:** Tailwind CSS 

---

## Source Structure

Minimal, organized layout to keep things simple and familiar:

```
src/
  App.jsx                    # Routes + providers wiring
  index.jsx                  # App entry
  assets/                    # Static files
  components/
    admin/                   # Admin-only UI
    auth/                    # Auth screens and guards
    common/                  # Reusable UI (Modal, Spinner, Skeleton)
    events/                  # Event UI (Dashboard, Card, Form, Modals)
    layout/                  # Header, Footer
  constants/                 # App constants (index.js)
  contexts/                  # AuthContext, LanguageContext
  hooks/                     # Reusable hooks (e.g., useRole)
  i18n/                      # Translations (index.js)
  lib/                       # Framework-agnostic libraries (firebase.js)
  services/                  # API/service utilities (emailService, imageService)
  styles/                    # Global styles (index.css)
  utils/                     # Helpers (e.g., user.js)
```

Conventions:
- Use `.jsx` for components; `.js` for non-JSX modules.
- Keep imports relative; no aliasing to avoid overengineering.
- Group domain UI under `components/events` to keep shared components uncluttered.
