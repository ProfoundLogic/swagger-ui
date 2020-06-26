import React from "react"
import PropTypes from "prop-types"
import ErrorImg from "../../../img/error.png";

export default class BaseLayout extends React.Component {
  constructor(){
    super();
    this.retryTimer = null;
  }

  static propTypes = {
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    oas3Selectors: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired
  }

  render() {
    let { errSelectors, specSelectors, getComponent } = this.props
    const isSpecificRoute = window.isSpecificRoute;

    // let SvgAssets = getComponent("SvgAssets")
    // let InfoContainer = getComponent("InfoContainer", true)
    // let VersionPragmaFilter = getComponent("VersionPragmaFilter")
    let Operations = getComponent("operations", true)
    let Models = getComponent("Models", true)
    let Row = getComponent("Row")
    let Col = getComponent("Col")
    let Errors = getComponent("errors", true)

    // const ServersContainer = getComponent("ServersContainer", true)
    // const SchemesContainer = getComponent("SchemesContainer", true)
    // const AuthorizeBtnContainer = getComponent("AuthorizeBtnContainer", true)
    const FilterContainer = getComponent("FilterContainer", true)
    // let isSwagger2 = specSelectors.isSwagger2()
    // let isOAS3 = specSelectors.isOAS3()

    const isSpecEmpty = !specSelectors.specStr()

    const loadingStatus = specSelectors.loadingStatus()

    if (isSpecificRoute && loadingStatus === "success") {
      let fileRouteError = specSelectors.pjsSpecificFileRouteError();
      if (fileRouteError) {
        let code = fileRouteError.get("code");
        let title = fileRouteError.get("title");

        // Watch out... React/Swagger Client runs this render function several times
        if (code == 100) {
          if (this.retryTimer == null) {
            window.parent.swaggerTestRetryMax--;
            if (window.parent.swaggerTestRetryMax > 0) {
              this.retryTimer = setTimeout(() => {
                if (this.retryTimer != null) {
                  clearTimeout(this.retryTimer);
                  this.retryTimer = null;
                  ui.specActions.download();
                }
              }, window.parent.swaggerTestRetryDelay);
            }
          }
        } else if (title) {
          let message = fileRouteError.get("message");
          let modFile = fileRouteError.get("modFile");
          return (
            <div className="swagger-ui pjs-api-column-full">
              <div className="wrapper pjs-spec-error-panel">
              <img height="48" className="pjs-panel-icon" src={ErrorImg} alt="Error" />
              <div>
                <div><b>{title}</b></div>
                { code == 101 && modFile && !message ? <div><br></br>It is served from: <b>{modFile}</b></div> : <div><br></br>{message}</div> }
              </div>
            </div>
            </div>
          );
        }
      }
    }

    let loadingMessage = null

    if (loadingStatus === "loading" || this.retryTimer) {
      // loadingMessage = <div className="info">
      //   <div className="loading-container">
      //     <div className="loading"></div>
      //   </div>
      // </div>

      loadingMessage = <div className="info loading-container">
        <div className="loading"></div>
      </div>
    }

    if (loadingStatus === "failed") {
      loadingMessage = <div className="info">
        <div className="loading-container">
          <h4 className="title">Failed to load API definition.</h4>
          <Errors />
        </div>
      </div>
    }

    if (loadingStatus === "failedConfig") {
      const lastErr = errSelectors.lastError()
      const lastErrMsg = lastErr ? lastErr.get("message") : ""
      loadingMessage = <div className="info failed-config">
        <div className="loading-container">
          <h4 className="title">Failed to load remote configuration.</h4>
          <p>{lastErrMsg}</p>
        </div>
      </div>
    }

    if (!loadingMessage && isSpecEmpty) {
      loadingMessage = <h4>No API definition provided.</h4>
    }

    if (loadingMessage) {
      return <div className={"swagger-ui " + (isSpecificRoute ? "pjs-api-column-full" : "pjs-api-column-partial")}>
        <div className="loading-container">
          {loadingMessage}
        </div>
      </div>
    }

    // const servers = specSelectors.servers()
    // const schemes = specSelectors.schemes()

    // const hasServers = servers && servers.size
    // const hasSchemes = schemes && schemes.size
    // const hasSecurityDefinitions = !!specSelectors.securityDefinitions()

    return (


      <Col className={isSpecificRoute ? "pjs-api-column-full" : "pjs-api-column-partial"}>
        <FilterContainer />

        <Row>
          <Col mobile={12} desktop={12} >
            <Operations />
          </Col>
        </Row>
        <Row>
          <Col mobile={12} desktop={12} >
            <Models />
          </Col>
        </Row>
      </Col>
    )
  }
}
