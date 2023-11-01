import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
    return c.text('Hello Hono!')
});

app.get('/hello/:name', (c) => {
    const name = c.req.param('name');
    return c.text(`Hello ${name}!`)
});

app.notFound((c) => {
    return c.text('404 not found', 404)
})

export default app;