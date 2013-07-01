
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
        var hue;

        this.num = num;
        hue = 360 * num / slice_count;
        this.stop0 = hsva_str(hue, 0, 1, 1);
        this.stop1 = hsva_str(hue, 0, 1, 1);
        this.stop2 = hsva_str(hue, 0.3, 1, 1);
        this.stop3 = hsva_str(hue, 0.1, 1, 1);
        this.stop4 = hsva_str(hue, 1, 1, 1);
        this.stop5 = hsva_str(hue, 1, 0.8, 1);
        this.stop6 = hsva_str(hue, 0.8, 1, 1);
    }

    function draw_wheel(canvas, slices) {
        var ctx, full_radius, gradient, s0, e0, s1, e1, s2, e2, i;

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

            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, full_radius);
            gradient.addColorStop(0, slices[i].stop0);
            gradient.addColorStop(0.23, slices[i].stop1);
            gradient.addColorStop(0.24, slices[i].stop2);
            gradient.addColorStop(0.25, slices[i].stop3);
            gradient.addColorStop(0.84, slices[i].stop4);
            gradient.addColorStop(0.85, slices[i].stop5);
            gradient.addColorStop(1, slices[i].stop6);
            ctx.fillStyle = gradient;
            ctx.rotate(i * Math.PI * 2 / slices.length);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, full_radius - 1, s0, e0, false);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, full_radius * 0.8, s1, e1, false);
            ctx.arc(0, 0, full_radius * 0.3, e2, s2, true);
            ctx.closePath();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#ccc';
            ctx.fill();

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
