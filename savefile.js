function patch_savefile()
{
        let fs1 = document.getElementById('save')
        let fs2 = document.getElementById('code')

        var select = document.getElementById('region');
        var value = select.options[select.selectedIndex].value;

        const savefile = fs1.files[0];
        const codefile = fs2.files[0];
        if ((!savefile) || (!codefile))
        {
                alert("Please upload your files.");
                return;
        }
        const reader1 = new FileReader();
        const reader2 = new FileReader();

        reader1.onload = function ()
        {
                const savedata = (reader1.result);
                const u8savedata = new Uint8Array(savedata);

                reader2.onload = function ()
                {
                        const codedata = (reader2.result);
                        const u8codedata = new Uint8Array(codedata);

                        for (let i = 0x420D; i < 0x420D + 0xE4; i++)
                        {
                                u8savedata[i] = 'A'.charCodeAt(0);
                        }
                        if (value == "PAL")
                        {
                                u8savedata[0x42F1] = 0x80; u8savedata[0x42F2] = 0x3E;
                                u8savedata[0x42F3] = 0xD2; u8savedata[0x42F4] = 0x14;
                        }
                        else if (value == "NTSC-U")
                        {
                                u8savedata[0x42F1] = 0x80; u8savedata[0x42F2] = 0x3E;
                                u8savedata[0x42F3] = 0xD2; u8savedata[0x42F4] = 0x7C;
                        }
                        else if (value == "NTSC-J")
                        {       
                                // to be done
                        }
                        for (let i = 0; i < u8codedata.length; i++)
                        {
                                try
                                {
                                        u8savedata[0x437c+i] = u8codedata[i];
                                }
                                catch
                                {
                                        alert("Invalid file");
                                }
                        }
                        let qld1_csm = 0;
                        let qld1_nsm = 0;
                        for (let i = 0; i < 2700; i++)
                        {
                                qld1_csm += u8savedata[0x4048+i];
                                qld1_nsm += ~u8savedata[0x4048+i];
                        }
                        let qld_csm = qlbChecksum(savedata, 0x4040, 0x1ffc);

                        let qld1_csm_b = be(qld1_csm);
                        let qld1_nsm_b = be(qld1_nsm);
                        let qld_csm_b = be(qld_csm);

                        const csm_addr = 0x603c;
                        const qld1_csm_addr = 0x4ad4;
                        const qld1_nsm_addr = 0x4ad8;
                        for (let i = 0; i < 4; i++)
                        {
                                u8savedata[csm_addr+i]=qld_csm_b[i];
                        }
                        for (let i = 0; i < 4; i++)
                        {       
                                u8savedata[qld1_csm_addr+i]=qld1_csm_b[i];
                        }       
                        for (let i = 0; i < 4; i++)
                        {       
                                u8savedata[qld1_nsm_addr+i]=qld1_nsm_b[i];
                        }

                        const blob = new Blob([u8savedata], { type: savefile.type });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = savefile.name + '.patched';
                        a.click();
                        URL.revokeObjectURL(url);

                }
                reader2.readAsArrayBuffer(codefile);
        }
        reader1.readAsArrayBuffer(savefile);
}

function qlbChecksum(arrBuf, offset, len) {
        // from https://icogn.github.io/tp-docs/docs/save-file/memory-card
        const view = new DataView(arrBuf);
        let sum = 0;
        let negSum = 0;

        let index = offset;
        const iterations = len >> 1;
        for (let i = 0; i < iterations; i++) {
                const val = view.getUint16(index);
                sum += val;
                negSum += ~val;
                negSum &= 0xffff;
                index += 2;
        }
        return ((sum << 0x10) & 0xffff0000) + negSum;
}

function be(n)
{
        return [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, (n >> 0) & 255];
}

function change_code()
{
        i=true;
        var select = document.getElementById('region');
        var value = select.options[select.selectedIndex].value;
        if (value=="PAL") 
        {
                document.getElementById("compile").innerHTML="powerpc-eabi-ld --oformat binary -Ttext=0x803ED214 {yourcode}.o -o {yourcode}"; 
        }
        else if (value == "NTSC-U")
        {
                document.getElementById("compile").innerHTML="powerpc-eabi-ld --oformat binary -Ttext=ntscu {yourcode}.o -o {yourcode}"; 
        }
        else if (value == "NTSC-J")
        {
                document.getElementById("compile").innerHTML="powerpc-eabi-ld --oformat binary -Ttext=ntscj {yourcode}.o -o {yourcode}"; 
        }
}
