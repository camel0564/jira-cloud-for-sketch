import { executeSafelyAsync, openInDefaultApp } from '../../util'

export default class Attachments {
  constructor (context, webUI, jira) {
    this.context = context
    this.webUI = webUI
    this.jira = jira
  }

  async loadAttachments (issueKey) {
    executeSafelyAsync(this.context, async () => {
      const issue = await this.jira.getIssue(issueKey)
      const attachments = issue.fields.attachment
      this.webUI.dispatchWindowEvent('jira.attachment.details', {
        issueKey,
        attachments
      })
      for (let i = 0; i < attachments.length; i++) {
        // TODO parallelize
        const attachment = attachments[i]
        if (attachment.thumbnail && attachment.mimeType) {
          this.webUI.dispatchWindowEvent('jira.attachment.thumbnail', {
            issueKey,
            id: attachment.id,
            dataUri: await this.jira.getImageAsDataUri(
              attachment.thumbnail,
              attachment.mimeType
            )
          })
        }
      }
    })
  }

  async deleteAttachment (issueKey, id) {
    executeSafelyAsync(this.context, async () => {
      await this.jira.deleteAttachment(id)
      this.loadAttachments(issueKey)
    })
  }

  async openAttachment (issueKey, url, filename) {
    executeSafelyAsync(this.context, async () => {
      const eventPayload = { issueKey, url }
      this.webUI.dispatchWindowEvent('jira.attachment.downloading', eventPayload)
      const filepath = await this.jira.downloadAttachment(url, filename)
      this.webUI.dispatchWindowEvent('jira.attachment.opened', eventPayload)
      openInDefaultApp(filepath)
    })
  }
}