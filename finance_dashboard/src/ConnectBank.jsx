import { usePlaidLink } from 'react-plaid-link'

function ConnectBank({ linkToken, onSuccess }) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      console.log('plaid success called with:', public_token)
      onSuccess(public_token)
    },
    onExit: (err, metadata) => {
      console.log('plaid exit:', err, metadata)
    },
    onEvent: (eventName) => {
      console.log('plaid event:', eventName)
    }
  })

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect Bank Account
    </button>
  )
}

export default ConnectBank