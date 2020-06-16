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

app.get('/api/tickets', (req, res) => {
    const page = req.query.page || 1
    let search = req.query.search || ''
    let data: Ticket[] = tempData

    const afterRegexp = /after\:(\d{1,2}\/\d{1,2}\/\d{4}) (.*)/ // can validate that the date is always dd/mm/yyyy if needed
    const afterRegResult = afterRegexp.exec(search) || []
    if (afterRegResult.length > 0) {
        const afterDateString = afterRegResult[1]
        search = afterRegResult[2]
        const afterTime = moment(afterDateString, 'DD/MM/YYYY').unix()
        data = data.filter((ticket) => {
            return ticket.creationTime / 1000 >= afterTime
        })
        if (isNaN(afterTime)) {
            data = []
        }
    }

    data = data.filter((t) =>
        (t.title.toLowerCase() + t.content.toLowerCase()).includes(
            search.toLowerCase()
        )
    )

    const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    res.send(paginatedData)
})

app.listen(PORT)
console.log('server running', PORT)
