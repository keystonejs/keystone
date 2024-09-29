'use server'

// ------------------------------
// Buttondown subscription
// ------------------------------
export async function subscribeToButtondown (pathname: string, formData: FormData) {
  try {
    const data = {
      email: formData.get('email'),
      tags: [
        ...formData.getAll('tags'),
        `source:keystonejs.com${pathname}`.substring(0, 80),
      ],
    }

    const buttondownResponse = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: data.email,
        tags: data.tags,
      }),
    })

    if (!buttondownResponse.ok) {
      const error = await buttondownResponse.json()
      return {
        // 409 status Conflict has no detail message
        error: error?.detail || 'Sorry, an error has occurred — please try again later.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('An error occurred: ', error)
    return {
      error: 'Sorry, an error has occurred — please try again later.',
    }
  }
}
