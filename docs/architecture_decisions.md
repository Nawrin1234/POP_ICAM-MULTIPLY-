# Architectural & Design Decisions

## Technical Stack
- **Framework**: React 19 for component-based UI state management.
- **Styling**: Tailwind CSS for rapid, responsive design and modern "glassmorphism" effects.
- **AI Service**: `@google/genai` using the `gemini-3-pro-image-preview` model for its superior image quality and real-time reasoning capabilities.
- **Audio**: Web Audio API used for real-time synthesis instead of static assets to reduce load times and allow for dynamic frequency shifts.

## Design Decisions

### 1. Aesthetics: Whimsical & Vibrant
- **Typography**: Chose **Fredoka One** for its rounded, friendly appearance, paired with **Quicksand** for readability.
- **Color Palette**: High-contrast, bright colors (Blue-600, Purple-500, Green-400) were selected to match the visual language of high-quality educational apps.

### 2. The "Magic Meter" vs. Level Count
- **Decision**: Instead of traditional "Level 1, Level 2," we use a progress meter. 
- **Reasoning**: It provides a more continuous sense of achievement and reduces the "start-stop" friction. Reaching 100% feels like a meaningful breakthrough rather than just completing a menu item.

### 3. Error Handling in Math
- **Decision**: If a player exceeds the target sum, the current sum resets, but bubbles remain. 
- **Reasoning**: It punishes mistakes slightly (loss of time/score) but doesn't halt the flow of the game, which is crucial for maintaining child engagement.

### 4. Reward UI Complexity
- **Decision**: Allowing children to choose aspect ratios and resolutions.
- **Reasoning**: Encourages a sense of agency and "creative control" over their reward, reinforcing that the effort put into the math translates directly into creative power.

### 5. API Key Management
- **Decision**: Utilizing the `window.aistudio` bridge for key selection.
- **Reasoning**: Adheres to strict security guidelines while ensuring the user is informed about billing and model requirements before they start the game.
