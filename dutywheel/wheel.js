
/*global document: false */

var activate_wheel;

(function () {
    "use strict";

    /**
     * Convert hue, saturation, value, and alpha to an RGBA string.
     * Hue is in degrees (0-360) and saturation and value are from 0 to 1.
     * See: http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
     */
    function hsva_str(h, s, v, alpha) {
        var c, x, m, h0, r0, g0, b0;

        c = v * s;
        x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        m = v - c;
        h0 = Math.abs(h) % 360;
        if (h0 < 60) {
            r0 = c;
            g0 = x;
            b0 = 0;
        } else if (h0 < 120) {
            r0 = x;
            g0 = c;
            b0 = 0;
        } else if (h0 < 180) {
            r0 = 0;
            g0 = c;
            b0 = x;
        } else if (h0 < 240) {
            r0 = 0;
            g0 = x;
            b0 = c;
        } else if (h0 < 300) {
            r0 = x;
            g0 = 0;
            b0 = c;
        } else {
            r0 = c;
            g0 = 0;
            b0 = x;
        }
        return ('rgba(' +
                Math.floor(255 * (r0 + m)) + ',' +
                Math.floor(255 * (g0 + m)) + ',' +
                Math.floor(255 * (b0 + m)) + ',' +
                alpha + ')');
    }

    function Slice(num, slice_count) {
        this.num = num;
        this.hue = 360 * num / slice_count;
        this.saturation = 1;
        this.value = 1;
        this.text = 'Refreshment ' + (num + 1);
    }

    function draw_wheel(canvas, slices) {
        var ctx, full_radius, gradient, s0, e0, s1, e1, s2, e2, i, h, s, v,
            text, text_circumference, text_height, text_width, max_text_width,
            text_x, j, text_angles;

        ctx = canvas.getContext('2d');
        full_radius = Math.min(canvas.width, canvas.height) / 2;
        // s0 and e0 are the start and end angles for the whole slice.
        s0 = -Math.PI / 2 - Math.PI / slices.length;
        e0 = -Math.PI / 2 + Math.PI / slices.length + 0.005;

        s1 = s0 + Math.PI * 0.02;
        e1 = e0 - Math.PI * 0.02;
        s2 = s0 + Math.PI * 0.05;
        e2 = e0 - Math.PI * 0.05;

        ctx.save();
        ctx.lineWidth = 2;
        ctx.translate(canvas.width / 2, canvas.height / 2);

        for (i = 0; i < slices.length; i += 1) {
            ctx.save();
            ctx.rotate(i * Math.PI * 2 / slices.length);

            h = slices[i].hue;
            s = slices[i].saturation;
            v = slices[i].value;
            text = slices[i].text;

            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, full_radius);
            // White center
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.24, '#fff');
            // Inner edge
            gradient.addColorStop(0.25, hsva_str(h, 0.4 * s, v, 1));
            // Glow from the middle
            gradient.addColorStop(0.26, hsva_str(h, 0.3 * s, v, 1));
            gradient.addColorStop(0.81, hsva_str(h, s, v, 1));
            // Rounded, beveled edge
            gradient.addColorStop(0.82, hsva_str(h, s, 0.6 * v, 1));
            gradient.addColorStop(0.89, hsva_str(h, s, 0.8 * v, 1));
            // Simulated reflection on the edge
            gradient.addColorStop(0.95, hsva_str(h, 0.8 * s, v, 1));
            gradient.addColorStop(1, hsva_str(h, s, v, 1));
            ctx.fillStyle = gradient;

            // Draw the slice.
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, full_radius - 1, s0, e0, false);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            // Draw a simulation of the personal image.
            ctx.beginPath();
            ctx.arc(0, 0, full_radius * 0.77, s1, e1, false);
            ctx.arc(0, 0, full_radius * 0.30, e2, s2, true);
            ctx.closePath();
            ctx.fillStyle = '#ccc';
            ctx.fill();

            // Measure the text and shrink it if necessary.
            text_height = Math.floor(0.11 * full_radius);
            ctx.font = 'bold ' + text_height + 'px sans';
            text_width = ctx.measureText(text).width;
            text_circumference = (full_radius * 0.87) * (2 * Math.PI);
            max_text_width = text_circumference / slices.length - 30;
            if (text_width > max_text_width) {
                // Shrink the text to fit.
                text_height = Math.floor(text_height * max_text_width / text_width);
                ctx.font = 'bold ' + text_height + 'px sans';
                text_width = ctx.measureText(text).width;
            }

            // Determine the rotation of each character.
            text_angles = [];
            for (j = 0; j < text.length; j += 1) {
                text_x = -text_width / 2 + ctx.measureText(text.substr(0, j)).width;
                // Convert text_x to radians.
                text_angles.push((text_x / text_circumference) * (2 * Math.PI));
            }

            // Stroke the text.
            ctx.strokeStyle = hsva_str(h, s, 0.75 * v, 1);
            ctx.lineWidth = 1;
            for (j = 0; j < text.length; j += 1) {
                ctx.save();
                ctx.rotate(text_angles[j]);
                ctx.strokeText(text[j], 0, -full_radius * 0.87);
                ctx.restore();
            }

            // Fill the text.
            ctx.fillStyle = '#fff';
            for (j = 0; j < text.length; j += 1) {
                ctx.save();
                ctx.rotate(text_angles[j]);
                ctx.fillText(text[j], 0, -full_radius * 0.87);
                ctx.restore();
            }

            ctx.restore();
        }
        ctx.restore();
    }

    activate_wheel = function () {
        var canvas, i, slice_count, slices;

        canvas = document.getElementById('wheel');
        if (!canvas.getContext) {
            return;
        }

        slice_count = 7;
        slices = [];
        for (i = 0; i < slice_count; i += 1) {
            slices.push(new Slice(i, slice_count));
        }

        draw_wheel(canvas, slices);
    };

}());
