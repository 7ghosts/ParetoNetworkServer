<template>
    <div class="main wrapp pareto-blue-dark">
        <div class="container-fluid px-lg-5 text-left">
            <div class="row m-0  pt-4 pt-lg-2" style="width: 100%;">
                <div class="col-12 order-last order-lg-first col-lg-2 mr-2 mb-4">
                    <VProfile :addressProfile="blockChainAddress" :can-edit="true"></VProfile>
                </div>
                <div class="col-12 col-lg-9 mt-sm-4 mt-md-0 mt-lg-0 mb-4">
                    <div class="row mb-md-4">
                        <div class="col-12 p-1 mt-x">
                            <label class="pareto-label" style="padding-left: 10px"><b>NEW INTEL</b></label>
                        </div>
                    </div>
                    <div class="row mt-4 mt-md-2">
                        <div v-show="!isPreview" class="col-lg-10 font-body p-1 mt-4 mt-md-1">
                            <div class="flex-row intel-container text-user-content">
                                <div class="group create-input-space">
                                    <input id="intel-title-input" style="width: 100%;"
                                           type="text" class="create-input create-content-text title-user-content"
                                           name="intel-title" v-model="title" required>
                                    <span class="floating-label create-content-text title-user-content">
                                    <b>Title </b>
                                    <span v-if="formError.title && !title"> <i class="fa fa-exclamation-circle shake"
                                                                               style="color: red"></i></span>
                                </span>
                                </div>
                                <svg height="1" width="100%" class="px-3">
                                    <line x1="0" y1="0" x2="100%" y2="0"
                                          style="stroke:rgb(255,255,255);stroke-width:2"/>
                                </svg>
                                <textarea v-show="false"
                                          id="intel-body-input"
                                          name="editordata"
                                          v-model="body">
                            </textarea>
                                <div v-if="intel.state !== 'empty'" class="d-flex justify-content-center">
                                    <label class="pareto-label"> {{intel.text}}
                                        <span v-if="intel.state === 'creating'">
                                         <i class="fa fa-spinner fa-spin"></i>
                                    </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div v-show="isPreview" class="col-lg-10 font-body p-1 mt-4 mt-md-1">
                            <div class="flex-row intel-container">
                                <div class="group create-input-space">
                                    <input
                                        type="text"
                                        class="create-input create-content-text title-user-content"
                                        name="intel-title"
                                        v-model="title" readonly>
                                </div>
                                <svg height="1" width="100%" class="px-3">
                                    <line x1="0" y1="0" x2="100%" y2="0"
                                          style="stroke:rgb(255,255,255);stroke-width:2"/>
                                </svg>
                                <div id="preview" class="note-editable text-user-content">
                                    <p v-html="body" style="padding-left: 10px;"></p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-2 d-flex flex-lg-column justify-content-end justify-content-lg-start">
                            <!-- <div class="col-md-3 col-lg-2 p-1 mt-4 mt-md-0 create-input-space">
                                <input type="number" v-model="tokens" class="create-input mt-0" step="0.000000001" required>
                                <span class="floating-label">
                                Pareto Amount
                                <span v-if="formError.tokens && !tokens">
                                    <i class="fa fa-exclamation-circle shake" style="color: red"></i>
                                </span>
                            </span>
                            </div> --> <!-- put in modal -->


                            <!-- if you want a preview button it goes here, last checked there was
                             a bug where the title variable would get trimmed in preview mode, but only visually.

                             <button class="btn btn-dark-secondary-pareto mt-2 order-lg-2"
                                    @click="showPreview()">
                                <b v-if="!isPreview">preview</b>
                                <b v-if="isPreview">edit</b>
                            </button> -->
                            <button
                                class="btn btn-dark-primary-pareto ml-2 ml-lg-0 mt-2 order-lg-1"
                                @click="validateContent()"
                                :disabled="intel.state === 'creating'">
                                <b>submit</b>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <b-modal
                v-model="modalToken"
                centered
                hide-header
                hide-footer
                @hide="hideModal"
                :body-bg-variant="'dark'"
                :body-text-variant="'light'">

                <b-container fluid>
                    <h4 class="font-body my-3"> CONFIRM INTEL </h4>
                    <div v-if="this.signType==='LedgerNano'" class="text-left">
                        <p> Before use Ledger Nano S, verify the next items: </p>
                        <div class="m-2 ml-4">
                            <ul>
                                <li> The Browser must be Google Chrome</li>
                                <li> Plugged-in their Ledger Wallet Nano S</li>
                                <li> Input digits pin</li>
                                <li> Navigated to the Ethereum app on their device</li>
                                <li> Enabled 'browser' support from the Ethereum app settings</li>
                            </ul>
                        </div>
                        <br/>
                    </div>

                    <!-- <div class="create-input w-100">
                        <div class="d-flex justify-content-start w-100 pr-5 pb-1 modal-input">
                            <span> Address </span>
                            <span class="ml-4 ellipsis"> {{blockChainAddress}} </span>
                        </div>
                    </div> -->

                    <div class="create-input w-100 mt-3">
                        <div class="d-flex justify-content-start w-100 pb-1 modal-input">
                            <span> Deposit </span>
                            <span class="ml-2">
                                    <img src="../assets/images/LogoMarkColor.svg" width="20px" alt="" class="mr-2">
                                </span>
                            <input type="number" id="tokenInput" class="nested-input" style="margin-top: -7px; margin-bottom: -7px;" step="1" v-bind:value="parseInt(maxTokens/30)" v-bind:max="maxTokens" v-bind:min="parseInt(maxTokens/50)" v-on:input="tokens = $('#tokenInput')[0].value" required>
                            <span v-if="formError.tokens && !tokens"> <i class="fa fa-exclamation-circle shake"
                                                                       style="color: red"></i></span>
                        </div>
                    </div>

                    <!-- minutes hours days weeks buttons -->
                    <!-- <div class="w-100 mt-3">
                        <div class="d-flex justify-content-start w-100 pr-5 pb-1 modal-input create-input">
                            <span>Priority </span>
                            <input type="number" class="nested-input mt-0" style="text-align: right;" step="1" value="100" required>
                            <span v-if="formError.tokens && !tokens">
                                    <i class="fa fa-exclamation-circle shake" style="color: red"></i>
                            </span>

                        </div>
                    </div> -->

                    <div class="w-100 mt-3" style="padding: 10px 0px 8px 15px; border-radius: 3px; border: 0px;">
                        <div class="d-flex justify-content-start w-100 pr-5 pb-1 modal-input">
                            <span class="mt-2"> Priority </span>
                            <VDelay :intelDelay="{}" class="ml-1 ml-md-5 d-flex flex-row align-items-end" @chosenPriority="chosenPriorityEvent"></VDelay>
                        </div>

                    </div>

                    <!-- Campaign length

                    <div class="w-100 mt-3" style="padding: 10px 0px 8px 15px; border-radius: 3px; border: 0px;">
                        <div class="d-flex justify-content-start w-100 pr-5 pb-1 modal-input">
                            <span class="mt-2"> Campaign </span>

                        </div>

                    </div> -->

                    <b-row class="m-2 mt-4 d-flex justify-content-end">
                        <button
                            class="btn btn-darker-secondary-pareto mt-2 ml-2 ml-lg-0 col-5"
                            @click="hideModal()">
                            Cancel
                        </button>
                        <button
                            class="btn btn-dark-primary-pareto mt-2 ml-2 col-5"
                            @click="validateConfirmToken()"
                            :disabled="!hardwareAvailable /*|| validateTokenAmount()*/">Confirm
                        </button>
                    </b-row>
                </b-container>
            </b-modal>
        </div>
    </div>

</template>

<script>
    import DashboardService from '../services/dashboardService';
    import AuthService from '../services/authService';
    import IntelService from '../services/IntelService';
    import VDelay from "./VDelay";
    import VProfile from "./VProfile.vue";
    import {mapState, mapActions} from "vuex";

    require('summernote/dist/summernote-bs4.css');
    require('summernote');

    export default {
        name: 'VCreateIntel',
      components: {VProfile, VDelay},
        data: function () {
            return {
                nextRoute: {
                    canAsk: true,
                    to: {}
                },
                logged: false,
                block: null,
                body: '',
                hardwareAvailable: false,
                content: '',
                priority: 2, //this is default priority and should be defined somewhere
                title: '',
                maxTokens: 1,
                blockChainAddress: '',
                tokens: '',
                intel: {
                    state: 'empty',  // 'creating', 'created'
                    text: '',
                },
                formError: {
                    title: false,
                    body: false,
                    tokens: false
                },
                modalToken: false,
                modalWaiting: false,
                modalCloseWarning: false,
                isPreview: false,
                words: [],
                assets: []
            };
        },
        updated: function () {
            this.$nextTick(function () {
                let edit = $('.note-editable')[0];
                if (edit) {
                    $(edit).keyup(() => {
                        this.body = edit.innerHTML;
                    });
                }
            });
        },
        computed: {
            bodyFunction: function () {
                return intel;
            },
            ...mapState(["madeLogin", "ws", "signType", "pathId", "userLastApprovedContractAddress"])
        },
        mounted: function () {
            IntelService.getAssets(r=>{
                this.assets = r;
                this.words = r.map(it=>{return it.symbol.charAt(0).toUpperCase() + it.symbol.slice(1).toLowerCase() });
            }, e=>{
                console.log(e);
            });
            $('#intel-body-input').summernote({
                placeholder: 'Content...',
                height: '40vh', // set editor height
                minHeight: null, // set minimum height of editor
                maxHeight: null, // set maximum height of editor
                focus: true, // set focus to editable area after initializing summernote
                link: [
                    ['link', ['linkDialogShow', 'unlink']]
                ],
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'clear']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['insert', ['link', 'picture']]
                ],
                popover: {
                    image: [],
                    link: [],
                    air: []
                },
                hint: {
                    words: this.words,
                    match: /\B\$(\w*)$/,
                    search:  (keyword, callback) =>{
                        callback(this.words.filter(item => {
                            return (item).indexOf((keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase())) === 0;
                        }));
                    },
                    content: (item)=>{
                       return  '$'+item
                    }
                }
            });
            this.address();
        },
        methods: {
            ...mapActions(["addTransaction", "transactionComplete", "editTransaction"]),
            address: function () {
                DashboardService.getAddress(res => {
                    this.block = res.block;
                    this.blockChainAddress = res.address;
                    this.maxTokens = res.tokens;
                }, () => {

                });
            },
            createIntel: function () {
                this.hideModal();

                this.intelState('creating', 'Creating Intel, please wait');

                this.tokens = $("#tokenInput")[0].value;

                this.$store.state.makingRequest = true;
                let assets=  this.assets.filter( it => { it.symbol = it.symbol.charAt(0).toUpperCase() + it.symbol.slice(1).toLowerCase(); return  this.body.indexOf("$"+it.symbol) > -1 });
                if(assets){
                    assets= assets.map(it=> {return it._id} )
                }

                IntelService.createIntel(
                    {block: this.block, title: this.title, body: this.body, address: this.blockChainAddress, priority: this.priority,
                        lastApproved: this.userLastApprovedContractAddress,
                        assets: assets },
                    this.tokens,
                    {signType: this.signType, pathId: this.pathId},
                    {
                        addTransaction: this.addTransaction,
                        transactionComplete: this.transactionComplete,
                        editTransaction: this.editTransaction,
                        toastTransaction: this.$notify
                    },
                    (res) => {
                        const intelId = res.res.intel;

                        this.$store.state.makingRequest = false;
                        this.intelState('created', 'Intel Created!');

                        this.$notify({
                            group: 'notification',
                            type: 'success',
                            duration: 10000,
                            text: 'The Intel was created'
                        });

                        this.modalWaiting = false;

                        this.redirectAfterCreateIntel(intelId);

                        //this.$router.push('/intel');
                    }, (err) => {
                        if (err.includes('Transaction was not mined within')) {
                            this.$notify({
                                group: 'notification',
                                type: 'warning',
                                duration: 20000,
                                title: 'Warning!',
                                text: err
                            });
                        } else {
                            this.intelState('empty', '');
                            this.modalWaiting = false;

                            if (typeof err === 'string')
                                err = 'Could not create Intel. ' + err.split('\n')[0];
                            this.$notify({
                                group: 'notification',
                                type: 'error',
                                duration: 20000,
                                text: err || 'Could not create Intel'
                            });

                            this.$store.state.makingRequest = false;
                        }
                    });
            },
            chosenPriorityEvent(chosenPriority) {
              this.priority =  chosenPriority;
            },
            hideModalWarning: function () {
                this.modalCloseWarning = false;
            },
            hideModal() {
                this.modalToken = false;
                if (this.signType === 'LedgerNano') {
                    AuthService.deleteWatchNano();
                    this.hardwareAvailable = false;
                }
            },
            intelState: function (state, text) {
                this.intel.state = state;
                this.intel.text = text;
            },
            isAvailable() {
                if (this.signType === 'LedgerNano') {
                    this.hardwareAvailable = false;
                    AuthService.doWhenIsConnected(() => {
                        this.hardwareAvailable = true;
                        AuthService.deleteWatchNano();
                    })
                } else {
                    this.hardwareAvailable = true;
                }
            },
            redirectAfterCreateIntel(intelId) {
                let params = {page: 0, limit: 10};
                return DashboardService.getIntelForLoggedInUser(params,
                    res => {
                        const intel = res.find(item => {
                            return intelId == item.id;
                        });
                        if(this.$route.path ===  '/create'){
                            this.$router.push(`intel/${intel.address}/${intel.txHash}`);
                        }
                    });
            },
            showModal() {
                this.modalToken = true;
                this.isAvailable();
            },
            showPreview() {
                this.isPreview = !this.isPreview;

                if (this.isPreview) {
                    $('.note-editor').hide();
                } else {
                    $('.note-editor').show();
                }
            },
            validateContent: function () {
                this.formError.title = !this.title;

                //The lenght is 12 because summernote, on first click, creates an empty p and br, creating 12 characters
                this.formError.body = (this.body || '').replace( new RegExp("<\s*a[^>]*>(.*?)<\s*/\s*a>"),"").length < 0 || !this.body;

                $('#miss-content').remove();
                if (this.formError.body) {
                    $('.note-placeholder').append('<i id="miss-content" class="fa fa-exclamation-circle shake" style="color: red"></i>')
                }

                if (this.formError.title || this.formError.body) return;

                this.showModal();
            },
            validateConfirmToken: function(){
                this.tokens = $('#tokenInput')[0].value;
                if(this.validateTokenAmount()){
                    this.formError.tokens = true;
                } else {
                    this.formError.tokens = false;
                    this.createIntel();
                }
            },
            validateTokenAmount: function () {
                return !this.tokens || parseFloat(this.tokens) <= 0 || parseFloat(this.tokens) > parseFloat(this.maxTokens);
            }
        }
    };
</script>

<style lang="scss">
    $light-blue-pareto: #1f344f;


    textarea a {
        text-decoration: underline;
        color: blue;
    }

    .note-toolbar-wrapper {
        height: 30.8px !important;
    }

    .note-editable a {
        text-decoration: underline;
        color: blue;
    }

    #preview a {
        text-decoration: underline;
        color: blue;
    }

    @media all and (max-width: 768px) {
        .header-img {
            width: 100px;
        }
    }

    @media all and (max-width: 575px) {
        .header-img {
            width: 90px;
        }
    }

    .bg-dark {
        background-color: transparent !important;
    }

    .create-input-space {
        position: relative;
    }

    .modal-content {
        border: 0;
        border-radius: 2px !important;
        background: #040f1e;
        box-shadow: 0px 25px 30px 1px black;
    }

    .modal-input {
        font-size: 13px;
    }

    .note-editable {
        background: $light-blue-pareto !important;
        color: white !important;
        padding: 20px 10px !important;
        font-size: 16px !important;
    }

    .note-editor.note-frame.panel {
        padding: 10px 10px 0px;
        border: none;
    }

    .note-btn {
        color: white;
    }

    .note-btn:hover {
        background: #679ab4 !important;
    }

    .note-image-btn {
        width: 150px;
    }

    .note-toolbar.panel-heading {
        padding: 0px;
        padding-left: 5px;
    }

    .note-toolbar.panel-heading a {
        color: black;
    }

    .note-hint-item {
        color: black;
    }

    .note-editing-area {
        margin-top: 2px;
    }

    .note-placeholder {
        color: white;
        font-size: 16px;
        padding-top: 20px !important;
    }

    #preview {
        border-radius: 3px;
        height: 442px;
        min-height: 300px;
        overflow: auto;
        width: 100%;
    }

    .floating-label {
        color: white;
        position: absolute;
        pointer-events: none;
        left: 10px;
        top: 10px;
        transition: 0.2s ease all;
        font-size: 14px;
        font-weight: bolder;
        padding-left: 10px;
    }

    @media(max-width : 500px) and (max-height : 700px){
        .mt-x {
            margin-top: 20px;
        }
    }

</style>