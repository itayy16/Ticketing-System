import express from 'express'
import moment from 'moment'
import bodyParser = require('body-parser')
import { tempData } from './temp-data'
import { Ticket } from '@ans-exam/client/src/api'

const app = express()

const PORT = 3232

const PAGE_SIZE = 20

app.use(bodyParser.json())

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    next()
})

function getRegexGroup(regex: RegExp, group: number, search: string) {
    const regexResult = regex.exec(search) || []
    if (regexResult.length > 0) {
        const result = regexResult[group + 1]
        return result
    }
}

app.get('/api/tickets', (req, res) => {
    const page = req.query.page || 1
    let search = req.query.search || ''
    let data: Ticket[] = tempData

    const afterRegex = /after\:(\d{1,2}\/\d{1,2}\/\d{4})/ // after:22/11/2017
    const afterValue = getRegexGroup(afterRegex, 0, search)
    if (afterValue) {
        const afterTime = moment.utc(afterValue, 'DD/MM/YYYY').unix()
        data = data.filter((ticket) => {
            return ticket.creationTime / 1000 >= afterTime
        })
    }

    const beforeRegex = /before\:(\d{1,2}\/\d{1,2}\/\d{4})/ // before:22/11/2019
    const beforeValue = getRegexGroup(beforeRegex, 0, search)
    if (beforeValue) {
        const beforeTime = moment
            .utc(beforeValue + ' 24:00:00', 'DD/MM/YYYY hh:mm')
            .unix() // the end of the day
        data = data.filter((ticket) => {
            return ticket.creationTime / 1000 <= beforeTime
        })
    }

    const fromEmailRegex = /from\:(\w*@\w*\.\w*)/ //from:myemail@email.com
    const fromEmailValue = getRegexGroup(fromEmailRegex, 0, search)
    if (fromEmailValue) {
        data = data.filter((ticket) => {
            return ticket.userEmail === fromEmailValue
        })
    }

    //Filters the search value from search filters
    let filteredSearch = search.replace(afterRegex, '')
    filteredSearch = filteredSearch.replace(beforeRegex, '')
    filteredSearch = filteredSearch.replace(fromEmailRegex, '')
    filteredSearch = filteredSearch.trim()

    if (filteredSearch) {
        data = data.filter((t) =>
            (t.title.toLowerCase() + t.content.toLowerCase()).includes(
                filteredSearch.toLowerCase()
            )
        )
    }

    const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    res.send(paginatedData)
})

app.listen(PORT)
console.log('server running', PORT)
