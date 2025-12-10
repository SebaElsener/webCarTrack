
class SessionStore {
    constructor() {
      this.sessions = new Map()
    }
  
    findSession(id) {
      return this.sessions.get(id)
    }
  
    saveSession(id, session) {
      this.sessions.set(id, session)
    }
  
    findAllSessions() {
      const allSessions = [...this.sessions.values()]
      return allSessions
    }

    deleteSession(id) {
      return this.sessions.delete(id)
    }

    deleteAllSessions() {
      this.sessions.clear()
    }

  }

  export default SessionStore