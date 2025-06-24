/*
  Search in the provided cid of a mutable data, get the data from the user data and show it
*/

// Global npm libraries
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Tabs, Tab, Spinner, Carousel } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

function UserDataReview (props) {
  const appData = props.appData
  const [media, setMedia] = useState([])
  const [markdown, setMarkdown] = useState('')
  const [activeTab, setActiveTab] = useState('media')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Get the id parameter from the URL
  const { cid } = useParams()

  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true)
      try {
        const { json } = await appData.wallet.cid2json({ cid })
        const userDataString = json.userData
        if (userDataString) {
          const userData = JSON.parse(userDataString)
          setMedia(userData.media)
          setMarkdown(userData.markdown)
        }
      } catch (error) {
        setError(error.message)
      }
      setLoading(false)
    }
    loadMedia()
  }, [cid, appData.wallet])

  return (
    <Container>
      <Row>
        <Col>
          {error && <p className='text-danger'>{error}</p>}
          {loading
            ? (
              <div className='text-center my-5'>
                <Spinner animation='border' role='status' variant='primary'>
                  <span className='visually-hidden'>Loading...</span>
                </Spinner>
              </div>
              )
            : (
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className='mb-4'
              >
                <Tab eventKey='media' title='Media'>
                  {media && media.length > 0
                    ? (
                      <div className='mt-3 mb-5'>
                        <Carousel>
                          {media.map((item, index) => (
                            <Carousel.Item key={index}>
                              <img
                                className='d-block w-100'
                                src={item.url}
                                alt={`Review media ${index + 1}`}
                                style={{ height: '400px', objectFit: 'contain' }}
                              />
                              <Carousel.Caption>
                                <p>Image {index + 1} of {media.length}</p>
                              </Carousel.Caption>
                            </Carousel.Item>
                          ))}
                        </Carousel>
                        <style>{`
                          .carousel-control-next,
                          .carousel-control-prev, 
                          .carousel-indicators {
                              filter: invert(100%);
                          }
                        `}
                        </style>
                      </div>
                      )
                    : (
                      <p className='mt-3'>No media content available</p>
                      )}
                </Tab>
                <Tab eventKey='markdown' title='Content'>
                  {markdown
                    ? (
                      <div className='markdown-content mt-3'>
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                      </div>
                      )
                    : (
                      <p className='mt-3'>No content available</p>
                      )}
                </Tab>
              </Tabs>
              )}
        </Col>
      </Row>
    </Container>
  )
}

export default UserDataReview
