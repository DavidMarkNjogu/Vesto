# Vesto Design System & Architecture

## 1. Core Identity
The Vesto interface is designed to be professional, trustworthy, and data-dense, borrowing the enterprise architecture of "Covera."

### Color Palette
* **Primary (Teal):** `#358c9c`
    * *Usage:* Navigation sidebars, primary action buttons, active states, brand highlights.
* **Secondary (Orange):** `#f68716`
    * *Usage:* Call-to-actions (CTAs), notifications, badges, highlights requiring attention.
* **Background (Canvas):** `#f5f5f5`
    * *Usage:* The main dashboard background area. Reduces eye strain compared to pure white.
* **Surface (Cards):** `#ffffff`
    * *Usage:* Data containers, tables, stat cards. Always elevated with `shadow-sm`.
* **Text (Primary):** `text-gray-800`
* **Text (Secondary):** `text-gray-500`

### Typography
* **Font Family:** `Inter` (sans-serif).
* **Headings:** Bold, dark grey.
* **Data:** Monospace numbers for tables (`font-mono`) to align prices and dates perfectly.

## 2. Layout Architecture
The application uses a **Shell Layout** strategy:
1.  **Sidebar (Fixed Left):**
    * Width: `w-64` (Expanded) / `w-20` (Collapsed).
    * Background: Primary Teal (`bg-primary`).
    * Text: White.
    * Behavior: Fixed position, independently scrollable.
2.  **Topbar (Fixed Top):**
    * Height: `h-16`.
    * Background: White (`bg-white`).
    * Border: Bottom border (`border-gray-200`).
    * Content: Page Title, Search, User Profile.
3.  **Main Content (Fluid Center):**
    * Margin: Left margin adjusts based on sidebar state (`ml-64` or `ml-20`).
    * Padding: `p-6` standard padding.
    * Scroll: Independent vertical scroll.

## 3. Component Patterns

### Stat Cards
* **Structure:** Title (top left), Value (big, bottom left), Icon (right, colored container).
* **Styling:** `bg-white rounded-xl shadow-sm border border-gray-100`.
* **Icon Containers:** Gradient backgrounds (`bg-gradient-to-br`) to add depth.

### Data Tables
* **Header:** Light grey background (`bg-gray-50`), uppercase text, smaller font (`text-xs`).
* **Rows:** Zebra striping (`table-zebra`), hover effects (`hover:bg-gray-50`).
* **Actions:** Right-aligned action buttons (Edit/Delete) that appear on hover (`group-hover:opacity-100`).

### Modals
* **Overlay:** Blurred black background (`backdrop-blur-sm bg-black/30`).
* **Container:** Rounded corners (`rounded-xl`), hidden overflow.
* **Header:** Colored header matching the brand (`bg-primary text-white`).