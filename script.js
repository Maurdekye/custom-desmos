var $ = document.querySelector.bind(document);

var calculator = Desmos.GraphingCalculator($("#calculator"), {advancedStyling: true});
window.onload = () => {

  calculator.settings.observe("invertedColors", () => {
    controlElems = document.querySelectorAll(".constainer, .controls, .controls *");
    if (calculator.settings.invertedColors) {
      controlElems.forEach(e => {
        e.style.backgroundColor = "#000";
        e.style.color = "#fff";
      });
    } else {
      controlElems.forEach(e => {
        e.style.backgroundColor = "revert";
        e.style.color = "revert";
      });
    }
  });

  $("#disable_graph").oninput = () => {
    var disable = !!$("#disable_graph").checked;
    calculator.updateSettings({graphpaper: !disable, zoomButtons: !disable});
  };

  var basecoords = NaN;

  // x scale slider
  var xchanging = false;
  $("#xscale").oninput = () => {
    if (!xchanging) {
      basecoords = {...calculator.graphpaperBounds.mathCoordinates};
      basecoords.xcenter = basecoords.left + basecoords.width / 2;
      xchanging = true;
    } else if (basecoords !== NaN) {
      var newcoords = {...basecoords};
      var slider = Number($("#xscale").value);
      newcoords.width = Math.pow(4, slider / 100) * basecoords.width;
      var halfwidth = newcoords.width/2;
      newcoords.left = basecoords.xcenter - halfwidth;
      newcoords.right = basecoords.xcenter + halfwidth;
      calculator.setMathBounds(newcoords);
    }
  }

  $("#xscale").onchange = () => {
    $("#xscale").value = 0;
    xchanging = false;
    basecoords = NaN;
  }

  // y scale slider
  var ychanging = false;
  $("#yscale").oninput = () => {
    if (!ychanging) {
      basecoords = {...calculator.graphpaperBounds.mathCoordinates};
      basecoords.ycenter = basecoords.bottom + basecoords.height / 2;
      ychanging = true;
    } else if (basecoords !== NaN) {
      var newcoords = {...basecoords};
      var slider = Number($("#yscale").value);
      newcoords.height = Math.pow(4, slider / 100) * basecoords.height;
      var halfheight = newcoords.height/2;
      newcoords.bottom = basecoords.ycenter - halfheight;
      newcoords.top = basecoords.ycenter + halfheight;
      calculator.setMathBounds(newcoords);
    }
  }

  $("#yscale").onchange = () => {
    $("#yscale").value = 0;
    ychanging = false;
    basecoords = NaN;
  }

  // latex generation
  $("#generate_latex").onclick = () => {
    var align_format = $("#add_align_formatting").checked;
    var flalign_format = $("#add_flalign_formatting").checked;
    var add_asterisk = $("#add_asterisk").checked;
    var indent = Number($("#indent").value);
  
    var raw_latex = calculator.getExpressions().map(e => e.latex);
    var final_text = "";
    
    if (align_format || flalign_format) {
      var groups = raw_latex.reduce((grps, lat) => {
        if (lat.trim() !== "") {
          grps[grps.length - 1].push(lat);
        } else if (grps[grps.length - 1].length !== 0) {
          grps.push([]);
        }
        return grps;
      }, [[]]).filter(g => g.length !== 0);

      var blocks = groups.map(grp => {
        var exprs = grp.map(latex => {
          var eqsign = latex.lastIndexOf("=")+1;
          latex = " ".repeat(indent) + latex.slice(0, eqsign) + "&" + latex.slice(eqsign);
          if (flalign_format) {
            return latex + "&\\\\";
          } else {
            return latex + "\\\\";
          }
        });

        var block_name = "align";
        if (flalign_format)
          block_name = "flalign";
        if (add_asterisk)
          block_name += "*";

        var header = "\\begin{" + block_name + "}\n";
        var footer = "\n\\end{" + block_name + "}"; 
        return header + exprs.join("\n") + footer;
      });
      final_text = blocks.join("\n");
    } else {
      final_text = raw_latex.join("\n");
    }
    $("#latex_out").value = final_text;
  };

  $("#copy").onclick = () => {
    $("#latex_out").select();
    document.execCommand('copy');
  }

  function clear() {
    calculator.removeExpressions(calculator.getExpressions());
  }

  $("#read").onclick = () => {
    var raw_eqs = $("#latex_out").value;
    raw_eqs = raw_eqs
      .replace(/\s*\\end{(fl)?align\*?}\s*\\begin{(fl)?align\*?}\s*/gm, "\n<br>\n")
      .replace(/\s*\\(begin|end){(fl)?align\*?}\s*/g, "");
    var eq_list = raw_eqs.split("\n");
    eq_list = eq_list
      .map(e => e.trim()
      .replace(/\\\\|&/gm, ""))
      .filter(e => e !== "")
      .map(e => e.replace("<br>", " "));
    var exprs = eq_list.map((e, i) => ({latex: e}));
    clear();
    calculator.setExpressions(exprs);
  }

  $("#clear").onclick = clear;
}
