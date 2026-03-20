# Moventra — Full Stack Event Platform

This repository contains the complete Moventra system, including backend services, web interface, and a native Android application.

---

## Overview

Moventra is a full-stack platform designed to simplify discovering and organizing real-world activities. It eliminates the need for fragmented communication channels such as messaging groups and reduces dependency on paid event platforms.

The system provides a unified environment where users can create, explore, and manage events across both web and mobile platforms.

---

## System Architecture

Moventra follows a structured full-stack architecture consisting of three main layers:

Backend API for business logic and data management

Web client for browser-based access

Native Android application for mobile interaction

All components communicate through RESTful APIs, ensuring consistency across platforms.

Features

Event creation and management

Location-based filtering (country and city)

Unified user experience across web and mobile

Mobile-first design principles

Scalable backend architecture

AI-assisted event title suggestions (via backend integration)

Project Structure

backend/ → API and server-side logic (Node.js, Express)

web/ → Frontend interface (HTML, CSS, JavaScript)

android/ → Native mobile application (Kotlin, Jetpack Compose)

## Tech Stack

Database: PostgreSQL with Prisma ORM

Backend: Node.js (Express)

Web: HTML, CSS, JavaScript

Mobile: Kotlin, Jetpack Compose

API Communication: REST + Retrofit

AI Integration: Gemini API (via backend)

## Design Approach

The platform is built with a focus on simplicity, performance, and scalability. The architecture separates concerns clearly between frontend and backend, allowing independent development and future extensibility.

Special attention is given to user experience by prioritizing fast interaction, minimal friction, and intuitive workflows for event creation and discovery.

## Purpose

The goal of this project is to demonstrate the design and implementation of a complete end-to-end system that integrates backend services, web technologies, and native mobile development into a single cohesive platform.

## Author

Alperen Büyükatak  
M.Sc. Information and Communication Technologies
