import React from 'react';
import PropTypes from "prop-types"

import SearchImg from "../../img/search.svg";

export default class CategoryFilter extends React.Component {
    searchText = "";
    treeItemInstances = [];

    static propTypes = {
        errSelectors: PropTypes.object.isRequired,
        errActions: PropTypes.object.isRequired,
        specActions: PropTypes.object.isRequired,
        specSelectors: PropTypes.object.isRequired,
        layoutSelectors: PropTypes.object.isRequired,
        layoutActions: PropTypes.object.isRequired,
        getComponent: PropTypes.func.isRequired
    }

    state = {
        treeData: []
    };

    componentDidMount() {
        this.refreshCategories();
    }

    refreshCategories = (event) => {
        let { specSelectors } = this.props;
        this.setState({ treeData: [] });
        this.treeItemInstances = [];

        let url = specSelectors.url();
        let parts = url.split("?");
        url = parts.shift().replace(/openapi\.json/i, "api-categories");

        let processResults = function (data) {
            if (!Array.isArray(data)) data = [];

            const categories = [];
            let allOthers = null;

            let loop = (data, parent) => {
                for (let i = 0; i < data.length; i++) {
                    // Skip null items or unnamed subcategories
                    if (!data[i] || (parent && !data[i].name)) continue;

                    let item = { name: data[i].name };

                    if (parent) {
                        item.urlSearch = `?cat=${parent.name}&subcat=${item.name}`;
                        parent.children = parent.children || [];
                        parent.children.push(item);
                    } else {
                        item.urlSearch = `?cat=${item.name}`;
                        if (item.name)
                            categories.push(item);
                        else
                            allOthers = item;
                    }

                    if (data[i].subCategories && data[i].subCategories.length)
                        loop(data[i].subCategories, item);
                }
            };

            loop(data);
            categories.unshift({ name: "All Categories", urlSearch: "", allItems: true });

            if (allOthers) {
                allOthers.name = "All Others";
                categories.push(allOthers);
            }

            this.setState({ treeData: categories });

            // If this was triggered from the Refresh button, then we need to show it
            if (event) this.performSearch();
        }

        let me = this;
        if (window.isdev) {
            setTimeout(() => {
                processResults.call(me, [{ "name": "", "subCategories": [{ "name": "" }] }, { "name": "Big Area B", "subCategories": [{ "name": "BBB" }, { "name": "Scot" }, { "name": "little a" }, { "name": "little b" }, { "name": "little c" }] }, { "name": "Business Area 1", "subCategories": [{ "name": "Insurance" }] }, { "name": "Business Area 4", "subCategories": [{ "name": "Warehouse" }] }, { "name": "Product XYZ", "subCategories": [{ "name": "Appliction y" }, { "name": "Appliction yyyy" }] }, { "name": "Scot", "subCategories": [{ "name": "Bug" }] }]);
            }, 3000);
        } else {
            fetch(url).then(response => {
                let data = null;
                if (!response.ok) {
                    let msg = `An error occured while retrieving the Categories.\nHTTP error ${response.status}: ${response.statusText}.`
                    alert(msg);
                } else
                    data = response.json();
                return data;
            }).then(data => processResults.call(me, data));
        }
    }

    onSearchTextChanged = (event) => {
        const { target: { value } } = event
        this.searchText = value;
    }

    handleKeyPress = (event) => {
        if (event.key === 'Enter')
            this.performSearch();
    }

    performSearch = () => {
        let { specActions, specSelectors } = this.props;
        let url = specSelectors.url();
        let parts = url.split("?");
        url = parts.shift();
        let urlSearch = "";

        let current = this.treeItemInstances.find(i => i.isSelected());
        if (current)
            urlSearch = current.getData().urlSearch;
        let searchText = this.searchText.trim();

        if (searchText) {
            //  bob "scot was here" noway
            let urlKeyWords = [];
            do {
                let keyWord = null;

                if (searchText.charAt(0) == '"') {
                    let endIdx = searchText.indexOf('"', 1);
                    if (endIdx < 0) endIdx = searchText.length;
                    keyWord = searchText.substring(1, endIdx).trim();
                    searchText = searchText.substring(endIdx + 1).trim();
                }
                else {
                    let endIdx = searchText.indexOf(' ', 1);
                    if (endIdx < 0) endIdx = searchText.length;
                    keyWord = searchText.substring(0, endIdx).trim();
                    searchText = searchText.substring(endIdx).trim();
                }

                if (keyWord)
                    urlKeyWords.push(`keyWords=${keyWord}`);

            } while (searchText);

            if (urlKeyWords.length)
                searchText = urlKeyWords.join("&");

            urlSearch += (urlSearch ? "&" : "?") + searchText;
        }

        urlSearch = encodeURI(urlSearch);
        specActions.updateUrl(url + urlSearch);
        specActions.download();
    }

    //onCategoryChanged = (event, data, newValue, instance) => {
    onCategoryChanged = (event, instance) => {

        // Select Selection state of all TreeInstances based on passed instance
        for(let i=0;i<this.treeItemInstances.length;i++){
            try {
                let ti = this.treeItemInstances[i];
                ti.setSelected( ti === instance);
            } catch(error){}
        }

        // Always perform search...
        setTimeout(() => this.performSearch());
    }

    render() {
        let { getComponent } = this.props;
        let Col = getComponent("Col");
        let CategoryTreeItem = getComponent("CategoryTreeItem", true);

        let loading = !this.state.treeData.length;

        return (
            <Col className="pjs-api-search-column">
                <div class="filter-box-heading">
                    <div class="title">Filter</div>
                </div>
                <div class="keywords-body">
                    <input type="text" onKeyPress={this.handleKeyPress} placeholder='Keywords or "phrase"' onChange={this.onSearchTextChanged} />
                    <img src={SearchImg} alt="Search" onClick={this.performSearch} />
                </div>
                {loading ?
                    <div className="loading-container">
                        <div className="loading"></div>
                    </div>
                    :

                    this.state.treeData.map((value, index) => {
                        return <CategoryTreeItem root="true" instances={this.treeItemInstances} data={value} onSelectionChanged={this.onCategoryChanged} refreshCategories={this.refreshCategories}></CategoryTreeItem>
                    })
                }
            </Col>
        );
    }
}