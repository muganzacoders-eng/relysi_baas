const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleMeetService {
  constructor() {
    this.calendar = google.calendar('v3');
    this.auth = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Set up service account credentials
    this.serviceAccountAuth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
  }

  // Create a Google Meet meeting
  async createMeeting(meetingData) {
    try {
      const event = {
        summary: meetingData.title,
        description: meetingData.description,
        start: {
          dateTime: meetingData.startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: meetingData.endTime,
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        attendees: meetingData.attendees || []
      };

      const response = await this.calendar.events.insert({
        auth: this.serviceAccountAuth,
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendNotifications: true
      });

      return {
        meetingUrl: response.data.hangoutLink,
        eventId: response.data.id,
        startTime: response.data.start.dateTime,
        endTime: response.data.end.dateTime
      };
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      throw new Error('Failed to create Google Meet session');
    }
  }

  // Generate instant meet link with fallback
  async generateInstantMeetLink() {
    try {
      // Try to create a quick meeting
      const event = {
        summary: 'Instant Meeting',
        start: {
          dateTime: new Date().toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(Date.now() + 60 * 60000).toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const response = await this.calendar.events.insert({
        auth: this.serviceAccountAuth,
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      return response.data.hangoutLink;
    } catch (error) {
      console.error('Error generating instant meet:', error);
      // Fallback to random meet ID
      const meetId = Math.random().toString(36).substring(2, 15);
      return `https://meet.google.com/new-${meetId}`;
    }
  }

  // Validate Google Meet link
  validateMeetLink(link) {
    const meetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
    return meetRegex.test(link);
  }
}

module.exports = new GoogleMeetService();