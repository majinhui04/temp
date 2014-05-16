(function () {
    "use strict";

    /*
     * (c) 2011 by md5file.com. All rights reserved.
     */

    /*jslint browser: true, indent: 4*/
    /*global FileReader, File, Worker, alert*/

    var file_id = 1, drop_zone;

    document.getElementById('drop_zone').onclick = function () {
      document.getElementById('files').click();

      return false;
    };

    if ((typeof File !== 'undefined') && !File.prototype.slice) {
      if(File.prototype.webkitSlice) {
        File.prototype.slice = File.prototype.webkitSlice;
      }

      if(File.prototype.mozSlice) {
        File.prototype.slice = File.prototype.mozSlice;
      }
    }

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob || !File.prototype.slice) {
      alert('File APIs are not fully supported in this browser. Please use latest Mozilla Firefox or Google Chrome.');
    }

    function hash_file(file, workers) {
      var i, buffer_size, block, threads, reader, blob, handle_hash_block, handle_load_block;

      handle_load_block = function (event) {
        for( i = 0; i < workers.length; i += 1) {
          threads += 1;
          workers[i].postMessage({
            'message' : event.target.result,
            'block' : block
          });
        }
      };
      handle_hash_block = function (event) {
        threads -= 1;

        if(threads === 0) {
          if(block.end !== file.size) {
            block.start += buffer_size;
            block.end += buffer_size;

            if(block.end > file.size) {
              block.end = file.size;
            }
            reader = new FileReader();
            reader.onload = handle_load_block;
            blob = file.slice(block.start, block.end);

            reader.readAsArrayBuffer(blob);
          }
        }
      };
      buffer_size = 64 * 16 * 1024;
      block = {
        'file_size' : file.size,
        'start' : 0
      };

      block.end = buffer_size > file.size ? file.size : buffer_size;
      threads = 0;

      for (i = 0; i < workers.length; i += 1) {
        workers[i].addEventListener('message', handle_hash_block);
      }
      reader = new FileReader();
      reader.onload = handle_load_block;
      blob = file.slice(block.start, block.end);

      reader.readAsArrayBuffer(blob);
    }


    

    function handle_worker_event(id) {
      return function (event) {
        if (event.data.result) {
          $("#" + id).parent().html(event.data.result);
        } else {
          $("#" + id + ' .bar').css('width', event.data.block.end * 100 / event.data.block.file_size + '%');
        }
      };
    }

    function handle_file_select(event) {
      event.stopPropagation();
      event.preventDefault();

      var i, output, files, file, workers, worker;
      files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
      output = [];

      for (i = 0; i < files.length; i += 1) {
        file = files[i];
        workers = [];

        output.push('<tr><td class="span12"><strong>', file.name, '</strong></td><td> (', file.type || 'n/a', ') - ', file.size, ' bytes</td></tr>');

        if (document.getElementById('hash_md5').checked) {
          output.push('<tr>', '<td>MD5</td><td> <div class="progress progress-striped active" style="margin-bottom: 0px" id="md5_file_hash_', file_id, '"><div class="bar" style="width: 0%;"></div></div></td></tr>');
          worker = new Worker('/js/calculator/calculator.worker.md5.js');
          worker.addEventListener('message', handle_worker_event('md5_file_hash_' + file_id));
          workers.push(worker);
        }



        hash_file(file, workers);
        file_id += 1;

      }

      document.getElementById('list').innerHTML = '<table class="table table-striped table-hover">' + output.join('') + '</table>' + document.getElementById('list').innerHTML;
    }




    document.getElementById('files').addEventListener('change', handle_file_select, false);
  }());