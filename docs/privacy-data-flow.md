# Privacy and data flow

The storyteller gives recording and AI-processing consent before audio is accepted. Audio metadata points to the private recording bucket. Transcription creates a transcript, extraction creates evidence-backed timeline facts, and only approved chapters enter a PDF export job. Voice generation is not part of this milestone and never runs without explicit consent.

Users should be able to delete a project and its dependent rows and Storage objects. The database schema uses cascading deletes for project data; the hosted deletion job must also remove each project's private Storage prefix before deleting the project row.
