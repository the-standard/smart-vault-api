const express = require('express')
const app = express()
const port = 3000 || process.env.PORT;

app.get('/', (req, res) => {
  res.json({hello: 'world'})
})

app.listen(port, () => {
  console.log(`Simple Price Feed app listening on port ${port}`)
})