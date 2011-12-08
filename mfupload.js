/*
 * JQuery MFupload v1.0
 *
 * Copyright 2011, Gianrocco Giaquinta
 * http://www.jscripts.hostoi.com/
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */

(function( $ ){

	var settings;
	
    var methods = {
        completed: function(){},
        start: function(){},
        loaded: function(){},
		progress: function(){},
        error: function(){},
		upload: function(files){
			
			nfiles = files.length;
			cfiles = nfiles;
			
			settings.init();
									
			if (typeof files !== "undefined") {
                for (var i=0; i< nfiles; i++) {
                    
					var ext = files[i].name.toLowerCase().split(/\./);
            		ext = ext[ext.length -1];
										
					if ( settings.type && settings.type.indexOf(ext) == -1 ) {
						var err = { err_no: 1, err_des: "File type error", fileno: i, filename: files[i].name };
						settings.error(err);
						cfiles --; if ( cfiles == 0) settings.completed(); 
			
					} else if ( settings.maxsize>0 && files[i].size > settings.maxsize*1048576 ) {
						var err = { err_no: 2, err_des: "File size error", fileno: i, filename: files[i].name };
						settings.error(err);
						cfiles --; if ( cfiles == 0) settings.completed(); 
						
					} else			
					{
						
					var xload = {fileno:i, filename: files[i].name, perc:0, sent: 0, total: 0};						
					settings.start(xload);			

					var xhr = new XMLHttpRequest();
					xhr.open("POST", settings.post_upload, true);
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            		xhr.upload.filenumb = i;
					xhr.filenumb = i;
					xhr.upload.filename = files[i].name;
										
					xhr.upload.addEventListener("progress", function (e) {
                	
					 if (e.lengthComputable) {
						 
						var loaded = Math.ceil((e.loaded / e.total) * 100);
                    	var xload = { fileno:this.filenumb, filename: this.filename, perc: loaded, sent: e.loaded, total: e.total };
						settings.progress(xload);
						
					 }
            		}, false);
            
					xhr.addEventListener("load", function (e) {
                		
						var result = jQuery.parseJSON(e.target.responseText);
						result.fileno = this.filenumb;
						settings.loaded(result);
						cfiles --; if ( cfiles == 0) settings.completed(); 
												
					}, false);
															
					var nef = new FormData();
					nef.append("folder", settings.folder);
					nef.append("file_element", settings.file_elem);
					nef.append("udata", settings.user_data);
				    nef.append(settings.file_elem, files[i]);
            		xhr.send(nef);
					
					}
								
					
                }
            } else {
                alert("no support");
            }
			
		}
	}

	$.fn.mfupload = function(opt) {
        
        settings = {
			
            'init'        : methods.init,
            'start'       : methods.start,
            'loaded'      : methods.loaded,
			'progress'    : methods.progress,
			'completed'	  : methods.completed,			
            'ini_text'	  : 'drag files to here',
            'over_text'   : 'drop files',
            'over_col'	  : 'white',
			'over_bkcol'  : 'green',
			'post_upload' : './upload.php',
            'maxsize'     : '1', //default 1MB
			'type'		  : '',
			'folder'	  : './',
			'user_data'	  : '',
			'file_elem'	  : ''
        };
		
	if(opt) $.extend(settings, opt);
	
	  this.each(function(){	
		
		settings.file_elem = "mf_file_"+$(this).attr("id");
		
		$(this).append('<div class="mf_upload_m"><input type="file" class="file" name="'+settings.file_elem+'" /><div class="mf_upload_ins"></div></div>');
			
		$(this).find(".mf_upload_m").css({
			'position': 'relative',
			'margin': 0,
			'padding':0,
			'width': 'inherit',
			'height' : 'inherit'
	  	});
					
		$(this).find(".file").css({
			'position': 'relative',
			'text-align': 'right',
			'-moz-opacity': '0',
			'filter': 'alpha(opacity: 0)',
			'opacity': '0',
			'z-index': '2',
			'width': '100%',
			'height' : '100%'
	  	});
		
		$(this).find(".mf_upload_ins").css({
			'position': 'absolute',
			'text-align': 'center',
			'z-index': '1',
			'width': '100%',
			'height' : '100%',
			'top':0,
			'left':0,	 
	  	});
						
		
		$(this).find('.mf_upload_ins').empty().html(settings.ini_text);
		
		/*
		$(document).bind({
                dragleave: function (e) {
                    e.preventDefault();
					$(this).find(".mf_upload_ins").css('background-color', 'inherit').html(settings.ini_text);
					
				},                
                dragover: function (e) {
					e.preventDefault();
					//$(this).find(".mf_upload_ins").css('color', settings.over_col);
					//$(this).find(".mf_upload_ins").css('background-color', settings.over_bkcol);
				}
         });
		 */
		
		$(this).bind({
                dragleave: function (e) {
                    e.preventDefault();
					$(this).find(".mf_upload_ins").css('color', 'inherit');
					$(this).find(".mf_upload_ins").css('background-color', 'inherit').html(settings.ini_text);
                },
                drop: function (e) {
                    e.preventDefault();
					$(this).find(".mf_upload_ins").css('color', 'inherit');
					$(this).find(".mf_upload_ins").css('background-color', 'inherit' ).html(settings.ini_text);
					
                },
                dragover: function (e) {
					e.preventDefault();
					$(this).find(".mf_upload_ins").css('color', settings.over_col);
					$(this).find(".mf_upload_ins").css('background-color', settings.over_bkcol);					
					$(this).find(".mf_upload_ins").html(settings.over_text);                
				}
         });
		 
		 this.addEventListener("drop", function (e) {
                e.preventDefault();
                methods.upload(e.dataTransfer.files);			
         },false);
		 	 
		 $(this).find('input').change(function(e){
			 methods.upload(e.target.files);
         });
			
	  });	
		
	}


})( jQuery );