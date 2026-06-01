# AI Smart Gate Access Management System 🚀

A full-stack AI-powered smart gate system that automates visitor registration, QR-based entry passes, email delivery, admin management, and face verification.

## Features

- Visitor Registration System
- QR Code Based Gate Pass Generation
- Automated Email Delivery using SMTP
- Face Detection using OpenCV
- Admin Authentication
- Visitor Entry Logs Management
- Security Verification Module
- Responsive React Dashboard

## Tech Stack

### Frontend
- React JS
- Vite
- Axios
- JavaScript
- CSS

### Backend
- Python
- Flask
- Flask REST APIs
- OpenCV
- JWT Authentication

### Database
- MySQL

### Services
- QR Code Generation
- Gmail SMTP Integration
- Computer Vision Processing


## System Architecture

```
React Frontend

        |

Flask REST API

        |

Business Services
(QR, Email, Face Verification)

        |

MySQL Database
```


## Workflow

1. Visitor submits registration details
2. System detects face using OpenCV
3. Visitor data is stored in MySQL
4. Unique QR gate pass is generated
5. QR pass is emailed to visitor
6. Security verifies visitor entry
7. Entry logs are stored


## Future Improvements

- Real-time QR scanning using webcam
- Advanced AI face recognition models
- Cloud deployment
- AI analytics dashboard


## Author

Harish Gubbala