

import React from "react"
import PropTypes from "prop-types"


export default class StandaloneLayout extends React.Component {

  static propTypes = {
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired
  }

  render() {
    let { errSelectors, specSelectors, getComponent } = this.props

    let Container = getComponent("Container")
    let Row = getComponent("Row")
    let Col = getComponent("Col")
    let CategoryFilter = getComponent("CategoryFilter", true)

    const Topbar = getComponent("Topbar", true)
    const BaseLayout = getComponent("BaseLayout", true)
    const OnlineValidatorBadge = getComponent("onlineValidatorBadge", true)


    let SvgAssets = getComponent("SvgAssets")
    let InfoContainer = getComponent("InfoContainer", true)
    let VersionPragmaFilter = getComponent("VersionPragmaFilter")
    let Errors = getComponent("errors", true)
    const ServersContainer = getComponent("ServersContainer", true)
    const SchemesContainer = getComponent("SchemesContainer", true)
    const AuthorizeBtnContainer = getComponent("AuthorizeBtnContainer", true)
    let isSwagger2 = specSelectors.isSwagger2()
    let isOAS3 = specSelectors.isOAS3()

    const servers = specSelectors.servers()
    const schemes = specSelectors.schemes()

    const hasServers = servers && servers.size
    const hasSchemes = schemes && schemes.size
    const hasSecurityDefinitions = !!specSelectors.securityDefinitions()
    const isLoading = specSelectors.loadingStatus() === "loading";
    let isSpecificRoute = window.isSpecificRoute;

    return (

      <Container className='swagger-ui'>
        {Topbar ? <Topbar /> : null}


        <div className='swagger-ui'>
          <SvgAssets />
          <VersionPragmaFilter bypass={isLoading} isSwagger2={isSwagger2} isOAS3={isOAS3} alsoShow={<Errors />}>
            <Errors />
            {isSpecificRoute ? null :
              <Row className="information-container">
                <Col mobile={12}>
                  <InfoContainer />
                </Col>
              </Row>
            }

            {/* Moved Authorized outside -- PJS always hides it anyways */}
            {hasServers || hasSchemes ? (
              <div className="scheme-container">
                <Col className="schemes wrapper" mobile={12}>
                  {hasServers ? (<ServersContainer />) : null}
                  {hasSchemes ? (<SchemesContainer />) : null}
                </Col>
              </div>
            ) : null}

            {/* It has to be here, but PJS always hides it */}
            {hasSecurityDefinitions ? (<AuthorizeBtnContainer />) : null}

            <Row className="pjs-main-container">
              {isSpecificRoute ? null : <CategoryFilter />}

              <BaseLayout />

            </Row>
          </VersionPragmaFilter>
        </div>


        <Row>
          <Col>
            <OnlineValidatorBadge />
          </Col>
        </Row>
      </Container>
    )
  }

}
