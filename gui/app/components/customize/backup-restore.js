// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import $ from 'jquery';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	browserSvc: service('browser'),
	buttonLabel: 'Start Backup',
    backupSpec: null,
    backupFilename: '',
    backupError: false,
	backupSuccess: false,
    restoreSpec: null,
	restoreButtonLabel: 'Perform Restore',
	restoreUploading: false,
	restoreUploadReady: false,

    didReceiveAttrs() {
		this._super(...arguments);

        this.set('backupSpec', {
            retain: true,
            org: this.get('appMeta.orgId')
        });

        this.set('restoreSpec', {
            overwriteOrg: true,
            recreateUsers: true
		});

		this.set('restoreFile', null);
	},

	didInsertElement() {
		this._super(...arguments);

		this.$('#restore-file').on('change', function(){
			var fileName = document.getElementById("restore-file").files[0].name;
			$(this).next('.custom-file-label').html(fileName);
		});
	},

	actions: {
		onBackup() {
			this.showWait();
			this.set('buttonLabel', 'Please wait, backup running...');
            this.set('backupFilename', '');
            this.set('backupSuccess', false);
			this.set('backupFailed', false);

			// If Documize Global Admin we perform system-level backup.
			// Otherwise it is current tenant backup.
			let spec = this.get('backupSpec');
			if (this.get('session.isGlobalAdmin')) {
				spec.org = "*";
			}

			this.get('onBackup')(spec).then((filename) => {
				this.showDone();
				this.set('buttonLabel', 'Start Backup');
                this.set('backupSuccess', true);
                this.set('backupFilename', filename);
			}, ()=> {
				this.showDone();
				this.set('buttonLabel', 'Run Backup');
                this.set('backupFailed', true);
			});
		},

		onRestore() {
			// do we have upload file?
			// let files = document.getElementById("restore-file").files;
			// if (is.undefined(files) || is.null(files)) {
			// 	return;
			// }

			// let file = document.getElementById("restore-file").files[0];
			// if (is.undefined(file) || is.null(file)) {
			// 	return;
			// }

			let filedata = this.get('restoreFile');
			if (is.null(filedata)) {
				return;
			}

			// start restore process
			this.showWait();
			this.set('restoreButtonLabel', 'Please wait, restore running...');
            this.set('restoreSuccess', false);
			this.set('restoreFailed', false);

			// If Documize Global Admin we perform system-level restore.
			// Otherwise it is current tenant backup.
			let spec = this.get('restoreSpec');
			if (this.get('session.isGlobalAdmin')) {
				spec.org = "*";
			}

			this.get('onRestore')(spec, filedata).then(() => {
				this.showDone();
				this.set('buttonLabel', 'Perform Restore');
                this.set('restoreSuccess', true);
			}, ()=> {
				this.showDone();
				this.set('restorButtonLabel', 'Perform Restore');
                this.set('restoreFailed', true);
			});
		},

		upload(event) {
			this.set('restoreUploading', true);
			this.set('restoreUploadReady', false);
			this.set('restoreFile', null);

			// const reader = new FileReader();
			const file = event.target.files[0];

			this.set('restoreFile', file);
			this.set('restoreUploadReady', true);
			this.set('restoreUploading', false);

			// let imageData;
			// reader.onload = () => {
			// 	imageData = reader.result;
			// 	this.set('restoreFile', imageData);
			// 	this.set('restoreUploadReady', true);
			// 	this.set('restoreUploading', false);
			// };

			// if (file) {
			// 	reader.readAsDataURL(file);
			// }
		}
	}
});
