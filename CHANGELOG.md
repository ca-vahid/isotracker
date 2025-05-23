# ISO Tracker Change Log

## April 07, 2025

### Added Features
- Added ability to search controls by technician name
- Updated search placeholder to indicate technician search capability

### Fixed Drag and Drop Issues
- Fixed instability in drag and drop functionality
- Improved state management during drag operations
- Simplified drag handlers to be more reliable
- Fixed the "Invalid time value" error during undo operations
- Added better error handling for drag and drop API calls

### Fixed Rich Text Editor Issues
- Replaced ReactQuill with direct Quill implementation to fix findDOMNode errors
- Fixed multiple toolbar issue by using a dedicated toolbar container
- Fixed format configuration in Quill by removing invalid 'bullet' format
- Added proper cleanup for Quill instances to prevent memory leaks
- Improved client-side only rendering for the editor

### Fixed Date Display Issues
- Fixed timezone conversion issue that caused dates to display one day earlier
- Implemented proper UTC date handling for consistent date display
- Enhanced date formatting functions with better error handling

### Improved Error Handling
- Added robust error handling for empty API responses
- Improved JSON parsing safety for API responses
- Added better error recovery mechanisms throughout the application
