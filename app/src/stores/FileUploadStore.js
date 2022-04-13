import axios from 'axios';
import { makeAutoObservable } from 'mobx';

export class FileUploadStore {
    fileUploadData = {
        name: '',
        defaults: {}
    };
    fileUploadErrors = {
        defaultVisible: false,
        defaultSearchable: false,
        defaultLinks: false
    };
    showFileUploadError = false;
    showFileUploadModal = false;
    isPopulating = false;

    visibleDimensions = { overview: [], detail: [] };

    constructor(store) {
        this.store = store;
        makeAutoObservable(this, {}, { deep: true });
    }

    setIsPopulatin = val => (this.isPopulating = val);

    changeFileUploadModalVisiblity = val => (this.showFileUploadModal = val);

    resetFileUploadData = () =>
        (this.fileUploadData = {
            name: '',
            defaults: {}
        });

    getDefaultNullValue = dataType => {
        switch (dataType) {
            case 'number':
                return '0';
            case 'list':
                return '';
            default:
                return '';
        }
    };

    uploadFile = async files => {
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await axios.post('file/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        Object.keys(response.data.columns).forEach(
            column =>
                (this.fileUploadData.defaults[column] = {
                    name: column,
                    isDefaultVisible: false,
                    isDefaultSearch: false,
                    isDefaultLink: false,
                    dataType: response.data.columns[column],
                    defaultNullValue: this.getDefaultNullValue(
                        response.data.columns[column]
                    ),
                    removeIfNull: false
                })
        );

        this.changeOriginalName(response.data.name);
        this.changeFileUplodAnchor(Object.keys(response.data.columns)[0]);
        this.changeDatasetName(response.data.name);

        return true;
    };

    changeOriginalName = val => (this.fileUploadData.originalName = val);

    changeFileUplodColumnType = (column, columnType) => {
        this.fileUploadData.defaults[column].defaultNullValue = columnType;
    };

    changeFileUplodAnchor = val => {
        this.fileUploadData.anchor = val;
    };

    changeDefaultBoolToggle = (column, feature) => {
        this.fileUploadData.defaults[column][feature] =
            !this.fileUploadData.defaults[column][feature];
    };

    changeColumnName = (column, val) => {
        this.fileUploadData.defaults[column].name = val;
    };

    changeDatasetName = val => (this.fileUploadData.name = val);

    changeNullReplacement = (column, val) => {
        this.fileUploadData.defaults[column].defaultNullValue = val;
    };

    isVisibleByDefaultSelected = () =>
        (this.fileUploadErrors.defaultVisible = !Object.keys(
            this.fileUploadData.defaults
        ).some(
            column => this.fileUploadData.defaults[column].isDefaultVisible
        ));

    isDefaultLinkSelected = () =>
        (this.fileUploadErrors.defaultLinks = !Object.keys(
            this.fileUploadData.defaults
        ).some(column => this.fileUploadData.defaults[column].isDefaultLink));

    isDefaultSarchSelected = () =>
        (this.fileUploadErrors.defaultSearchable = !Object.keys(
            this.fileUploadData.defaults
        ).some(column => this.fileUploadData.defaults[column].isDefaultSearch));

    setDefaults = async () => {
        this.isVisibleByDefaultSelected();
        this.isDefaultLinkSelected();
        this.isDefaultSarchSelected();
        this.showFileUploadError = Object.keys(this.fileUploadErrors).some(
            errorCode => this.fileUploadErrors[errorCode]
        );

        if (this.showFileUploadError) {
            return false;
        }

        this.setIsPopulatin(true);

        const params = {
            original_name: this.fileUploadData.originalName,
            name: this.fileUploadData.name,
            anchor: this.fileUploadData.anchor,
            defaults: JSON.stringify(this.fileUploadData.defaults)
        };

        try {
            await axios.get('file/settings', { params });
        } catch (error) {
            this.store.core.handleError(error);
        }

        this.resetFileUploadData();
        this.changeFileUploadModalVisiblity(false);
        this.setIsPopulatin(false);
    };

    cancelFileUpload = async () => {
        const params = { name: this.fileUploadData.originalName };

        try {
            await axios.get('file/cancel', { params });
            this.resetFileUploadData();
            this.changeFileUploadModalVisiblity(false);
        } catch (error) {
            this.store.core.handleError(error);
            this.changeFileUploadModalVisiblity(false);
        }
    };
}
