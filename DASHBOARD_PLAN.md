# Dashboard Implementation Plan

## Phase 1: Foundation (Design System Integration)
- [x] **Configure Tailwind:** Update `tailwind.config.js` with the Vesto/Covera color palette (Primary `#358c9c`, Secondary `#f68716`).
- [x] **Create Component Directory:** Establish `client/src/components/admin` for organized file structure.

## Phase 2: Core Components (The "Shell")
- [ ] **Sidebar Component:** Create `AdminSidebar.jsx` with collapsible logic and Covera styling.
- [ ] **Topbar Component:** Create `AdminTopbar.jsx` for global search and user actions.
- [ ] **StatCard Component:** Create `StatCard.jsx` for consistent metric display.

## Phase 3: Dashboard Logic (The "Brain")
- [ ] **Refactor `Dashboard.jsx`:**
    - [ ] Remove monolithic code.
    - [ ] Import and implement the new Sidebar/Topbar shell.
    - [ ] Update state management for "Overview", "Products", and "Orders" tabs.
    - [ ] Integrate API calls with the new UI structure.

## Phase 4: Product Management (Inventory)
- [ ] **Table UI:** Implement the "Zebra" striping and hover actions.
- [ ] **Variant Support:** Ensure the table displays variant counts (e.g., "4 Variants").
- [ ] **Add/Edit Modal:** - [ ] Style the modal header with the Primary color.
    - [ ] Ensure image upload logic (base64) is preserved.
    - [ ] Validate input fields.

## Phase 5: Verification
- [ ] **Visual Check:** Does the sidebar collapse smoothly?
- [ ] **Data Check:** Do the numbers on the Stat Cards match the table data?
- [ ] **Responsiveness:** Does the layout break on smaller screens?