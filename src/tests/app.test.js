
const axios = require("axios")

test('Try helloWord',async ()=>{
	const response = await axios.get("http://localhost:3000/api/helloWordl")
	expect(response.status).toBe(200)

	console.log(response)
	//expect(response.data)
})
