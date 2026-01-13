import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/es'
import 'dayjs/locale/zh-cn'

dayjs.extend(utc)
dayjs.extend(timezone)

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
dayjs.tz.setDefault(localTimezone)

const originalFormat = dayjs.prototype.format
dayjs.prototype.format = function (template: string) {
    if (template === 'YYYY-MM-DDTHH:mm:ssZ') {
        return this.toISOString()
    }
    return originalFormat.call(this, template)
}

export default dayjs
