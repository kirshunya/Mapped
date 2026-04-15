# Mapped - UML Class Diagram Documentation

## Overview

This document describes the class diagram for the Mapped application - a map-based social platform with microservices architecture.

**Generated:** 2026-03-21  
**Standard:** UML 2.0

## Files

- `class-diagram.mmd` - Mermaid format (for GitHub rendering, VS Code preview)
- `class-diagram.puml` - PlantUML format (for IntelliJ, Visio export, PDF generation)

## Entity Classes Summary

| Service | Class | Description |
|---------|-------|-------------|
| auth-service | **User** | User accounts with authentication and profile |
| chat-service | **Chat** | Chat rooms (direct or group) |
| chat-service | **ChatMember** | Chat participants |
| chat-service | **ChatMessage** | Messages in chats |
| media-service | **MediaFile** | Uploaded media files |
| places-service | **Place** | Map locations/points of interest |
| places-service | **Group** | User groups |
| places-service | **GroupMember** | Group members |
| posts-service | **Post** | User posts/publications |
| posts-service | **PostComment** | Comments on posts |
| posts-service | **PostReaction** | Likes/dislikes on posts |
| posts-service | **CommentReaction** | Likes/dislikes on comments |
| reviews-service | **Review** | Place reviews with ratings |
| reviews-service | **ReviewReaction** | Likes/dislikes on reviews |
| reviews-service | **ReviewComment** | Comments on reviews (tree structure) |

## Enumerations

| Enum | Values | Used by |
|------|--------|---------|
| **Role** | user, moderator, admin | User.Role |
| **Privacy** | public, private, group | Place.Privacy |
| **ApprovalStatus** | pending, approved, rejected | Place.Approval |

---

## Relationship Types (UML Standard)

### Legend

| Type | UML Notation | Symbol | Description |
|------|--------------|--------|-------------|
| **Association** | Solid line | `──` | Classes are related, reference each other |
| **Aggregation** | Hollow diamond | `◇──` | "Has-a" relationship, part can exist independently |
| **Composition** | Filled diamond | `◆──` | "Owns" relationship, part cannot exist without whole |
| **Dependency** | Dashed arrow | `..>` | One class uses/depends on another |
| **Generalization** | Hollow triangle | `──▷` | Inheritance (not used in this diagram) |
| **Realization** | Dashed triangle | `..▷` | Interface implementation (not used) |

---

## All Relationships

### Compositions (◆── filled diamond)

Compositions indicate ownership - when the "whole" is deleted, the "parts" are also deleted.

| Owner | Part | Multiplicity | Rationale |
|-------|------|--------------|-----------|
| **Chat** | ChatMember | 1 : 0..* | Members don't exist without a chat |
| **Chat** | ChatMessage | 1 : 0..* | Messages don't exist without a chat |
| **Group** | GroupMember | 1 : 0..* | Membership records don't exist without group |
| **Post** | PostComment | 1 : 0..* | Comments don't exist without the post |
| **Post** | PostReaction | 1 : 0..* | Reactions don't exist without the post |
| **PostComment** | CommentReaction | 1 : 0..* | Reactions on comments |
| **Review** | ReviewReaction | 1 : 0..* | Reactions don't exist without review |
| **Review** | ReviewComment | 1 : 0..* | Comments don't exist without review |

### Aggregations (◇── hollow diamond)

Aggregations indicate "has-a" relationships where the part can exist independently.

| Owner | Part | Multiplicity | Rationale |
|-------|------|--------------|-----------|
| **ReviewComment** | ReviewComment | 0..1 : 0..* | Self-reference for nested comments (tree), parent is optional |

### Associations (── solid line)

Associations indicate general relationships between classes across service boundaries.

| From | To | Multiplicity | Description |
|------|----|--------------|-------------|
| **User** | Chat | 1 : 0..* | User owns/creates chats |
| **User** | ChatMember | 1 : 0..* | User participates in chats |
| **User** | ChatMessage | 1 : 0..* | User sends messages |
| **User** | MediaFile | 1 : 0..* | User uploads media |
| **User** | Place | 1 : 0..* | User creates places |
| **User** | Group | 1 : 0..* | User owns groups |
| **User** | GroupMember | 1 : 0..* | User joins groups |
| **User** | Post | 1 : 0..* | User authors posts |
| **User** | PostComment | 1 : 0..* | User writes comments |
| **User** | PostReaction | 1 : 0..* | User reacts to posts |
| **User** | CommentReaction | 1 : 0..* | User reacts to comments |
| **User** | Review | 1 : 0..* | User writes reviews |
| **User** | ReviewReaction | 1 : 0..* | User reacts to reviews |
| **User** | ReviewComment | 1 : 0..* | User writes review comments |
| **Group** | Place | 0..1 : 0..* | Group contains places (optional) |
| **Place** | Review | 1 : 0..* | Place has reviews |
| **Place** | Post | 0..1 : 0..* | Place is tagged in posts (optional) |

### Dependencies (..> dashed arrow)

Dependencies show that a class uses an enumeration or type.

| From | To | Description |
|------|----|-------------|
| **User** | Role | Uses Role enum for user roles |
| **Place** | Privacy | Uses Privacy enum for visibility |
| **Place** | ApprovalStatus | Uses ApprovalStatus for moderation |

---

## Microservice Boundaries

The diagram is organized by microservice packages:

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  auth-service   │   │  chat-service   │   │  media-service  │
│  ─────────────  │   │  ─────────────  │   │  ─────────────  │
│  User           │   │  Chat           │   │  MediaFile      │
│  Role           │   │  ChatMember     │   │                 │
│                 │   │  ChatMessage    │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ places-service  │   │  posts-service  │   │ reviews-service │
│  ─────────────  │   │  ─────────────  │   │  ─────────────  │
│  Place          │   │  Post           │   │  Review         │
│  Group          │   │  PostComment    │   │  ReviewReaction │
│  GroupMember    │   │  PostReaction   │   │  ReviewComment  │
│  Privacy        │   │  CommentReaction│   │                 │
│  ApprovalStatus │   │                 │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## How to Render

### Mermaid (class-diagram.mmd)

1. **GitHub** - just commit the file, GitHub renders .mmd files
2. **VS Code** - install "Markdown Preview Mermaid Support" extension
3. **Online** - paste code at https://mermaid.live

### PlantUML (class-diagram.puml)

1. **IntelliJ IDEA** - install PlantUML plugin, right-click → Generate
2. **VS Code** - install PlantUML extension, Alt+D to preview
3. **Online** - paste code at http://www.plantuml.com/plantuml
4. **CLI** - `java -jar plantuml.jar class-diagram.puml`

### Export to PDF/PNG

```bash
# Using PlantUML CLI
java -jar plantuml.jar -tpng class-diagram.puml
java -jar plantuml.jar -tpdf class-diagram.puml
java -jar plantuml.jar -tsvg class-diagram.puml
```

---

## Notes for Visio/A1 Print

For printing on A1 with 5mm grid:
- Grid step: 5mm
- Row height: 5mm  
- Font size: 3.5mm (approximately 10pt)
- Use PlantUML export to SVG, then import to Visio for editing
